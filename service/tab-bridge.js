/**
 * Created by kangtian on 16/10/22.
 */


var AV = require('../lib/tab-login');
var TabUtil = require('../lib/tab-util');
var HttpUtil = require('../lib/http-util');
var TablesMeta = require('../config/tables-meta');
var MemCache = require('../lib/mem-cache');
var mem_cache = new MemCache();
var md5 = require('blueimp-md5');

var CACHE_SYNC_PERIOD_SEC = 3600 * 3;    // 内存缓存与数据库固化存储的同步周期


function save_records_with_merge(req, res, next) {
    var data = req.body;
    var class_name, fields_to_merge, record_list;

    if (data) {
        class_name = data['class_name'];
        fields_to_merge = data['merge_fields'];
        record_list = data['record_list'];
    }

    if (! class_name) {
        HttpUtil.resp_json(res, {status: 'error', data: 'Not found: class_name'});
    }

    if (! record_list instanceof Array) {
        HttpUtil.resp_json(res, {status: 'error', data: 'Filed record_list must be: list'});
    }

    var record_obj_list = record_list.map(function (x) {
        var RecordObj = AV.Object.extend(class_name);
        var record = new RecordObj();
        for (var key in x) {
            if (! x.hasOwnProperty(key))
                continue;
            record.set(key, x[key]);
        }
        return record;
    });

    fields_to_merge = fields_to_merge || TablesMeta.get_merge_fields(class_name);    // 得到默认的合并字段列表.
    TabUtil.save_records_with_merge(record_obj_list, fields_to_merge).then(function () {
        if (! data['merge_fields']) {
            HttpUtil.resp_json(res, {
                status: 'ok',
                data: 'Success, but you not given field: merge_fields, we use default setting: '
            });
        } else {
            HttpUtil.resp_json(res, {status: 'ok', data: 'Success, saved num: ' + record_obj_list.length});
        }
    });
}


function save_record_with_cache(req, res, next) {
    var data = req.body;
    var class_name, record;

    if (data) {
        class_name = data['class_name'];
        record = data['record'];
        if (typeof(record) == 'string') {
            try {
                record = JSON.parse(record);
            } catch (e) {
                record = undefined;
            }
        }
    }

    if (! class_name)
        return HttpUtil.resp_json(res, {status: 'error', data: 'Not found: class_name'});
    if (! record)
        return HttpUtil.resp_json(res, {status: 'error', data: 'Not found: record'});

    var RecordObj = AV.Object.extend(class_name);
    var r = new RecordObj();
    for (var key in record) {
        if (! record.hasOwnProperty(key))
            continue;
        r.set(key, record[key]);
    }
    CACHE_SYSTEM.save_record_with_cache(r).then(function (record) {
        if (record == 'hit') {
            console.log('cache hit, class: ' + record.className + ', time: ' + new Date());
            return HttpUtil.resp_json(res, {status: 'ok', data: 'hit cache, do not need save/update.'});
        } else {
            try {
                return HttpUtil.resp_json(res, {status: 'ok', data: record.id});
            } catch (e) {
                return HttpUtil.resp_json(res, {status: 'error', data: e.message});
            }
        }
    });
}


function CacheSystem(is_sync_with_db, sync_period_sec) {
    this.is_sync_with_db = is_sync_with_db == undefined ? true : is_sync_with_db;
    this.sync_period_sec = sync_period_sec == undefined ? CACHE_SYNC_PERIOD_SEC : sync_period_sec;
    this.sync_timer = null;
    this.count_total = 0;
    this.count_hit = 0;

    if (this.is_sync_with_db) {
        this.loading_cache_from_db();
        this.start_sync_with_db();
    }
}
CacheSystem.prototype.loading_cache_from_db = function () {
    var query = new AV.Query("MemoryCache");
    query.descending("createdAt");
    TabUtil.find(query).then(function (records) {
        if (records.length == 0)
            return;
        var record = records[0];
        var cached_map = record.get("cached_map");
        for (var key in cached_map) {
            // 如果 key 不在内存, 则加载进内存.
            if (cached_map.hasOwnProperty(key) && mem_cache.get(key) == undefined) {
                mem_cache.set(key, cached_map[key]);
            }
        }
    })
};

CacheSystem.prototype.save_cache_to_db = function () {
    console.log(new Date() + " -- start save_cache_to_db.");
    if (! mem_cache.is_changed) {
        console.log(new Date() + " -- save_cache_to_db: do not changed.");
        return;
    }

    var key_list = mem_cache.keys();
    var query = new AV.Query("MemoryCache");
    query.descending("createdAt");
    TabUtil.find(query).then(function (records) {
        var record;
        if (records.length == 0) {
            var MemoryCacheObj = AV.Object.extend("MemoryCache");
            record = new MemoryCacheObj();
        } else {
            record = records[0];
        }

        var cached_map = {};
        key_list.forEach(function (key) {
            cached_map[key] = mem_cache.get(key)
        });
        record.set("cached_map", cached_map);
        TabUtil.save(record).then(function () {
            console.log(new Date() + " -- save_cache_to_db success.");
            mem_cache.is_changed = false;
        })
    });
};


CacheSystem.prototype.save_record_with_cache = function (record) {
    if (! record)
        throw new Error("Parameter error: record is not a object.");

    var class_name = record.className;
    var class_config = TablesMeta.get_class_config(class_name);
    if (! class_config || class_config.support_cache_save != true) {
        throw new Error("record (class is: " + class_name + ") not support cache_save.");
    }

    var distinct_index_fields = TablesMeta.get_distinct_index_fields(class_name);
    var need_update_fields = TablesMeta.get_need_update_fields(class_name);

    function get_hash_of_fields(record, fields) {
        if (!fields || fields.length == 0)
            return undefined;
        var value_list = fields.map(function (field) {
            var value = record.get(field);
            if (typeof (value) == 'object') {
                value = JSON.stringify(value);
            } else {
                value = value.toString();
            }
            return value;
        });
        var distinct_index_str = value_list.join(',');
        return md5(distinct_index_str);
    }

    function do_save(record) {
        return new Promise(function(resolve, reject) {
            TabUtil.save(record).then(function (saved) {
                try {
                    var this_cache_obj = {
                        hash_distinct_index: hash_distinct_index,
                        hash_need_update_fields: hash_need_update_fields,
                        class_name: class_name,
                        update_time: saved.updatedAt,
                        object_id: saved.id
                    };
                    mem_cache.set(hash_distinct_index, this_cache_obj);
                } catch (e) {
                    reject(e);
                }
                resolve(saved);
            }, reject);
        });
    }

    var hash_distinct_index = get_hash_of_fields(record, distinct_index_fields);
    var hash_need_update_fields = get_hash_of_fields(record, need_update_fields);

    console.log('CacheSystem: count_total: ' + this.count_total + ', count_hit: ' + this.count_hit);
    this.count_total += 1;

    try {
        var cache_obj = mem_cache.get(hash_distinct_index);
    } catch (e) {
        console.error(e);
    }

    if (! cache_obj
            || cache_obj && hash_need_update_fields && cache_obj['hash_need_update_fields'] != hash_need_update_fields) {
        // need save record.

        // save to memory cache first.
        var to_save = null;
        var this_cache_obj = {
            hash_distinct_index: hash_distinct_index,
            hash_need_update_fields: hash_need_update_fields,
            class_name: class_name,
        };
        mem_cache.set(hash_distinct_index, this_cache_obj);

        if (record.id) {    // 已经存在的对象, 直接保存
            to_save = record;
            return do_save(to_save);
        } else if (cache_obj && cache_obj.object_id) {
            // 在内存缓存中记录的对象, 以相应的 objectId 直接保存
            to_save = record;
            to_save.id = cache_obj.object_id;
            return do_save(to_save);
        } else {
            var query = new AV.Query(class_name);
            distinct_index_fields.forEach(function (field) {
                query.equalTo(field, record.get(field));
            });
            return new Promise(function(resolve, reject) {
                TabUtil.find(query).then(function (records) {
                    if (records.length > 0) {
                        to_save = records[0];
                        for (var key in record.attributes) {
                            if (record.attributes.hasOwnProperty(key))
                                to_save.set(key, record.get(key));
                        }
                    } else {
                        to_save = record;
                    }
                    do_save(to_save).then(resolve, reject);
                });
            });
        }
    } else {
        this.count_hit += 1;
        return new Promise(function(resolve, reject) {
            resolve('hit');
        });
    }

};

CacheSystem.prototype.start_sync_with_db = function () {
    if (! this.sync_timer) {
        this.sync_timer = setInterval(this.save_cache_to_db, this.sync_period_sec * 1000);    // 定期同步.
    }
};

CacheSystem.prototype.stop_sync_with_db = function () {
    if (this.sync_timer) {
        clearInterval(this.sync_timer);
        this.sync_timer = null;
    }
};


var CACHE_SYSTEM = new CacheSystem();


var TabBridge = {
    save_records_with_merge: save_records_with_merge,
    save_record_with_cache: save_record_with_cache
};

module.exports = TabBridge;