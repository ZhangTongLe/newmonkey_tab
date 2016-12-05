/**
 * Created by kangtian on 16/10/22.
 *
 * TODO:
 *     cache-save 批量保存需要优化, 现在仍然是单条 save.
 */

'use strict';

var AV = require('../lib/tab-login');
var G = require('../config/global');
var TabUtil = require('../lib/tab-util');
var DsUtil = require('../lib/ds_util');
var HttpUtil = require('../lib/http-util');
var TablesMeta = require('../config/tables-meta');
var MemCache = require('../lib/mem-cache');
var mem_cache = new MemCache();
var md5 = require('blueimp-md5');

var CACHE_SYNC_PERIOD_SEC = 60 * 10;    // 内存缓存与数据库固化存储的同步周期


function save_records_with_merge(req, res, next) {
    var data = req.body;
    var class_name, fields_to_merge, fields_common, record_list;

    if (data) {
        class_name = data['class_name'];
        fields_to_merge = data['merge_fields'];
        fields_common = data['common_fields'];
        record_list = data['record_list'];
        if (typeof(record_list) == 'string') {
            try {
                record_list = JSON.parse(record_list);
            } catch (e) {
                record_list = undefined;
            }
        }
    }

    if (! class_name) {
        HttpUtil.resp_json(res, {status: 'error', data: 'Not found: class_name'});
    }

    if (! DsUtil.is_type(record_list, 'Array')) {
        HttpUtil.resp_json(res, {status: 'error', data: 'Filed record_list must be: list'});
    }

    console.info('save_records_with_merge: class name: ' + class_name);
    console.info('save_records_with_merge: record_list' + JSON.stringify(record_list));

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
    fields_common = fields_common || TablesMeta.get_common_fields(class_name);    // 得到默认的公共字段列表.
    TabUtil.save_records_with_merge(record_obj_list, fields_to_merge, fields_common).then(function () {
        if (! data['merge_fields'] || ! data['common_fields']) {
            var msg = 'Success, ';
            if (! data['merge_fields'])
                msg += ', but you not given field: merge_fields, we use default setting: [' + fields_to_merge.join(', ') + ']';
            if (! data['common_fields'])
                msg += ', but you not given field: common_fields, we use default setting: [' + fields_common.join(', ') + '].';
            HttpUtil.resp_json(res, {
                status: 'ok',
                data: msg
            });
        } else {
            HttpUtil.resp_json(res, {status: 'ok', data: 'Success, saved num: ' + record_obj_list.length});
        }
    }, function (e) {
        HttpUtil.resp_json(res, {status: 'error', data: 'Error: here is the call stack: ' + e.stack});
    });
}


function save_record_with_cache(req, res, next) {
    console.log('save_record_with_cache - in');
    try {
        var data = req.body;
        var class_name, record, record_list;

        if (data) {
            class_name = data['class_name'];
            record = data['record'];
            record_list = data['record_list'];

            if (typeof(record) == 'string') {
                try {
                    record = JSON.parse(record);
                } catch (e) {
                    record = undefined;
                }
            }
            if (typeof(record_list) == 'string') {
                try {
                    record_list = JSON.parse(record_list);
                } catch (e) {
                    record_list = undefined;
                }
            }
        }

        if (! class_name)
            return HttpUtil.resp_json(res, {status: 'error', data: 'Not found: class_name'});
        if (! record && ! record_list)
            return HttpUtil.resp_json(res, {status: 'error', data: 'Not found: record | record_list.'});

        if (record && ! record_list) {
            record_list = [record];
        }

        console.info('save_record_with_cache: class name: ' + class_name);
        console.info('save_record_with_cache: record_list' + JSON.stringify(record_list));

        var save_check = function (record) {
            var class_name = record.className;
            if (class_name == 'View') {
                if (record.get('is_activity_changed') == G.NUM_TAG_BOOL.undefined || record.get('is_tree_changed') == G.NUM_TAG_BOOL.undefined) {
                    return false;
                }
            }
            return true;
        };

        var RecordObj = AV.Object.extend(class_name);
        var to_save_list = [];
        record_list.forEach(function (record) {
            var r = new RecordObj();
            for (var key in record) {
                if (! record.hasOwnProperty(key))
                    continue;
                r.set(key, record[key]);
            }
            to_save_list.push(r);
        });

        CACHE_SYSTEM.save_records_with_cache(to_save_list, save_check)
            .then(function (result) {
                HttpUtil.resp_json(res, result)
            }, function (e) {
                HttpUtil.resp_json(res, {status: 'error', data: e.stack});
            });
    } catch (e) {
        HttpUtil.resp_json(res, {status: 'error', data: e.stack});
    }
}

function CacheSystem(is_sync_with_db, sync_period_sec) {
    this.is_sync_with_db = is_sync_with_db == undefined ? true : is_sync_with_db;
    this.sync_period_sec = sync_period_sec == undefined ? CACHE_SYNC_PERIOD_SEC : sync_period_sec;
    this.sync_timer = null;
    this.STATUS_HIT = 'hit';
    this.STATUS_NOT_NEED_SAVE = 'not_need_save';
    this.CHANGE_TIMES = 'change_times';

    // 统计命中率, 每次和数据库同步后清零.
    this.stat = {
        count_total: 0,
        count_hit: 0
    };

    return this;
}
CacheSystem.prototype.init = function () {
    var self = this;
    if (self.is_sync_with_db) {
        self.loading_cache_from_db();
        self.start_sync_with_db();
    }
};
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
    var self = this;

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
        try {
            var stat = self.stat;
            record.increment('count_total', stat.count_total);
            record.increment('count_hit', stat.count_hit);
            var cached_map = {};
            key_list.forEach(function (key) {
                cached_map[key] = mem_cache.get(key)
            });
            record.set("cached_map", cached_map);
            TabUtil.save(record).then(function () {
                console.log(new Date() + " -- save_cache_to_db success.");
                mem_cache.is_changed = false;
                stat.count_total = stat.count_hit = 0;
            })
        } catch (e) {
            console.error(e);
        }

    });
};
CacheSystem.prototype.save_record_with_cache = function (record, save_check) {
    var self = this;

    try {
        if (! record)
            throw new Error("Parameter error: record is not a object.");

        var class_name = record.className;
        var class_config = TablesMeta.get_class_config(class_name);
        if (! class_config || class_config.support_cache_save != true) {
            throw new Error("record (class is: " + class_name + ") not support cache_save.");
        }

        var distinct_index_fields = TablesMeta.get_distinct_index_fields(class_name);
        var need_update_fields = TablesMeta.get_need_update_fields(class_name);

        var get_hash_of_fields = function (record, fields) {
            if (!fields || fields.length == 0)
                return undefined;
            var value_list = fields.map(function (field) {
                var value = record.get(field);
                if (typeof (value) == 'object') {
                    value = JSON.stringify(value);
                } else if (value == null || value == undefined) {
                    value = '';
                } else {
                    value = value.toString();
                }
                return value;
            });
            var distinct_index_str = value_list.join(',');
            return md5(distinct_index_str);
        };

        var handle_to_save = function (record) {
            return new Promise(function(resolve, reject) {
                resolve({hash_distinct_index: hash_distinct_index, record: record});
            });
        };

        var hash_distinct_index = get_hash_of_fields(record, distinct_index_fields);
        var hash_need_update_fields = get_hash_of_fields(record, need_update_fields);

        console.log('CacheSystem: count_total: ' + self.stat.count_total + ', count_hit: ' + self.stat.count_hit);
        self.stat.count_total += 1;

        var cache_obj = mem_cache.get(hash_distinct_index);

        if (! cache_obj
            || cache_obj && hash_need_update_fields && cache_obj['hash_need_update_fields'] != hash_need_update_fields) {

            // need save record ?
            if (save_check) {
                if (! save_check(record)) {
                    return handle_to_save(self.STATUS_NOT_NEED_SAVE);
                }
            }

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
                to_save.increment(self.CHANGE_TIMES, 1);
                return handle_to_save(to_save);
            } else if (cache_obj && cache_obj.object_id) {
                // 在内存缓存中记录的对象, 以相应的 objectId 直接保存
                to_save = record;
                to_save.id = cache_obj.object_id;
                to_save.increment(self.CHANGE_TIMES, 1);
                return handle_to_save(to_save);
            } else {
                var query = new AV.Query(class_name);
                distinct_index_fields.forEach(function (field) {
                    query.equalTo(field, record.get(field));
                });
                var field_change_time = self.CHANGE_TIMES;
                return new Promise(function(resolve, reject) {
                    TabUtil.find(query).then(function (records) {
                        try {
                            if (records.length > 0) {
                                to_save = records[0];
                                to_save.increment(field_change_time, 1);
                                for (var key in record.attributes) {
                                    if (record.attributes.hasOwnProperty(key))
                                        to_save.set(key, record.get(key));
                                }
                            } else {
                                to_save = record;
                            }
                            resolve({hash_distinct_index: hash_distinct_index, record: to_save});    // same to handle_to_save().
                        } catch (e) {
                            reject(e);
                        }
                    }, reject);
                });
            }
        } else {
            self.stat.count_hit += 1;
            return handle_to_save(self.STATUS_HIT);
        }
    } catch (e) {
        console.error(e);
        return new Promise(function(resolve, reject) {
            reject(e);
        });
    }
};
CacheSystem.prototype.save_records_with_cache = function (record_list, save_check) {
    var self = this;
    return new Promise(function(resolve, reject) {
        try {
            var msg_list = [];
            var err_msg_list = [];
            var promise_list = [];

            if (! DsUtil.is_type(record_list, 'Array')) {
                console.log('in');
                record_list = [record_list];
            }

            console.log('record_list: type: ' + typeof(record_list));
            console.log('record_list: ' + record_list);
            console.log('record_list: json: ' + JSON.stringify(record_list));

            record_list.forEach(function (record) {
                var p = CACHE_SYSTEM.save_record_with_cache(record, save_check);
                promise_list.push(p);
            });

            // _to_save_info 包含了待批量保存的记录.
            Promise.all(promise_list).then(function (_to_save_info) {
                try {
                    var to_save_info = [];
                    _to_save_info.forEach(function(info, i){
                        var record = info.record;
                        if (record == self.STATUS_HIT) {
                            msg_list.push('Index: ' + i + ', Success: ' + 'hit cache, time: ' + new Date());
                        } else if (record == self.STATUS_NOT_NEED_SAVE) {
                            msg_list.push('Index: ' + i + ', Success: ' + 'do not need save, time: ' + new Date());
                        } else {
                            info.index = i;    // 标记这是属于第几条数据
                            to_save_info.push(info);
                            msg_list.push('Index: ' + i + ', Pending: ' + 'will be saved.');
                        }
                    });
                    if (to_save_info.length > 0) {
                        var to_save_records = to_save_info.map(function (info) {
                            return info.record;
                        });
                        console.log('save_records_with_cache: try save all start.');
                        AV.Object.saveAll(to_save_records, function (saved_records) {
                            if (! saved_records) {
                                err_msg_list.push('Error: when AV.Object.saveAll(). saved_records is null, please check field type.');
                            }
                            console.log('save_records_with_cache: try save all success. num: ' + to_save_info.length);
                            saved_records.forEach(function (saved, i) {
                                try {
                                    var hash_distinct_index = to_save_info[i].hash_distinct_index;
                                    var cache_obj = mem_cache.get(hash_distinct_index);
                                    cache_obj['update_time'] = saved.updatedAt;
                                    cache_obj['object_id'] = saved.id;

                                    mem_cache.set(hash_distinct_index, cache_obj);
                                    msg_list.push('Index: ' + to_save_info[i].index + ', Success: objectId: ' + saved.id + ', time: ' + new Date());
                                    console.log('save to mem-cache success.');
                                    return do_return();
                                } catch (e) {
                                    console.log('3');
                                    console.error(e);
                                    err_msg_list.push('Index: ' + to_save_info[i].index + ', Error: ' + e.stack);
                                    return do_return();
                                }
                            });
                        }, function (e) {
                            console.log('save_records_with_cache: try save all failed.');
                            console.error(e);
                            err_msg_list.push('Error: when AV.Object.saveAll(). call stack: ' + e.stack);
                            return do_return();
                        });
                    } else {
                        return do_return();
                    }
                } catch (e) {
                    console.error(e);
                    err_msg_list.push('Error: when Promise.all().then(). call stack: ' + e.stack);
                    return do_return();
                }
            }, function (e) {
                console.error(e);
                err_msg_list.push('Index: unknown' + ', Error: ' + e.stack);
                return do_return();
            });

            var do_return = function () {
                if (err_msg_list.length == 0) {
                    resolve({status: 'ok', data: msg_list});
                } else {
                    resolve({status: 'error', data: err_msg_list.concat(msg_list)});
                }
            }
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
};
CacheSystem.prototype.start_sync_with_db = function () {
    var self = this;
    var is_dev = G.is_dev();
    if (is_dev) {
        console.info('CacheSystem: In Dev, do not sync.')
    }
    if (! self.sync_timer && ! is_dev) {    // 开发环境不进行数据同步
        self.sync_timer = setInterval(function() {
            self.save_cache_to_db();
        }, self.sync_period_sec * 1000);    // 定期同步.
    }
};
CacheSystem.prototype.stop_sync_with_db = function () {
    var self = this;
    if (self.sync_timer) {
        clearInterval(self.sync_timer);
        self.sync_timer = null;
    }
};


var CACHE_SYSTEM = new CacheSystem();
CACHE_SYSTEM.init(CACHE_SYSTEM);


var TabBridge = {
    save_records_with_merge: save_records_with_merge,
    save_record_with_cache: save_record_with_cache,
    save_record_with_cache_inner: function(record) {
        return CACHE_SYSTEM.save_records_with_cache(record);
    }
};

module.exports = TabBridge;