/**
 * Created by kangtian on 16/9/12.
 */

var G = require('../config/global');
var TablesMeta = require('../config/tables-meta');
var AV = require('./tab-login');
var Promise = require("leancloud-storage/dist/node/promise.js");
var DELAY_MS = 3000;
var MERGED_FIELD = 'merged';
var MAX_MERGED_NUM = 100;
var MERGED_INDEX_FIELD = 'merged_index';


// 静态实例, 共享对象变量。
var TabUtil = {
    _delay_ms: DELAY_MS,
    _merged_field: MERGED_FIELD,
    _merged_index_field: MERGED_INDEX_FIELD,
    _max_merged_num: MAX_MERGED_NUM,

    set_avg_delay_ms: function (ms) {
        TabUtil._delay_ms = ms;
    },
    default_reject: function (e) {
        console.error(e);
    },
    get_random_delay_ms: function (delay_ms) {
        delay_ms = delay_ms || TabUtil._delay_ms;
        return Math.random() * delay_ms;
    },
    save: function (record, callback, callback_fail, save_query, try_count) {
        if (try_count == undefined)
            try_count = 0;
        if (try_count > 5)
            console.error("save failed.\n" + JSON.stringify(record));

        var after_save;
        if (! save_query)
            after_save = record.save();
        else {
            after_save = record.save(null, {
                query: save_query
            });
        }

        return new Promise(function (resolve, reject) {
            after_save.then(function (record) {
                if (callback)
                    callback(record);
                if (resolve)
                    resolve(record);
            }, function (error) {
                if (error.message.indexOf('A unique field was given a value that is already taken.') > -1)
                    console.error(error.message);
                else if (error.message.indexOf('Too many requests.') > -1){
                    var delay_ms = TabUtil.get_random_delay_ms();
                    console.error('save, try again..., delay '+delay_ms);
                    setTimeout(function () {
                        TabUtil.save(record, callback, callback_fail, save_query, try_count + 1);
                    }, delay_ms);
                } else {
                    if (callback_fail)
                        callback_fail(error);
                    if (reject)
                        reject(error);
                    if (! reject && ! callback_fail) {
                        TabUtil.default_reject(error);
                    }
                }
            })
        });
    },
    find: function (query_obj, callback_ok, callback_fail, try_count) {
        if (try_count == undefined)
            try_count = 0;
        if (try_count > 5)
            callback_fail();

        if (! query_obj._limit || query_obj._limit <= 0)
            query_obj.limit(G.TAB_LIMIT);    // 设置为最大的 limit.
        return new Promise(function (resolve, reject) {
            query_obj.find().then(function (records) {
                if (records.length > 0) {
                    var need_unmerge = records.reduce(function (pre_result, cur_item) {    // 判断是否需要 unmerge.
                        return pre_result || TabUtil._merged_field in cur_item.attributes;
                    }, false);
                    if (need_unmerge)
                        records = TabUtil.unmerge_records(records, TabUtil._merged_field);
                }
                if (callback_ok)
                    callback_ok(records);
                if (resolve)
                    resolve(records)
            }, function (error) {
                if (error.message.indexOf('Too many requests.') > -1){
                    var delay_ms = TabUtil.get_random_delay_ms();
                    console.error('find, try again..., delay '+delay_ms);
                    setTimeout(function () {
                        TabUtil.find(query_obj, callback_ok, callback_fail, try_count + 1);
                    }, delay_ms);
                } else {
                    if (callback_fail)
                        callback_fail(error);
                    if (reject)
                        reject(error);
                    if (! reject && ! callback_fail) {
                        TabUtil.default_reject(error);
                    }
                }
            });
        });
    },
    find_all: function (query_obj, callback_ok, callback_fail) {
        // 同时支持了 callback 和 promise.
        return new Promise(function (resolve, reject) {
            var query_before = function(query_obj, date, record_list, resolve, reject){
                query_obj.lessThanOrEqualTo('createdAt', date);
                query_obj.descending('createdAt');
                TabUtil.find(query_obj, function (records) {
                    try{
                        record_list = Array.prototype.concat(record_list, records);
                    } catch (e) {
                        console.error(e);
                    }

                    if (records.length >= G.TAB_LIMIT){
                        var new_date = records[records.length - 1].createdAt;
                        query_before(query_obj, new_date, record_list, resolve, resolve)
                    } else {
                        if (resolve)
                            resolve(record_list);
                        if (callback_ok)
                            callback_ok(record_list);
                    }
                }, function (e) {
                    if (reject)
                        reject(e);
                    if (callback_fail)
                        callback_fail(e);
                })
            };

            var now = new Date();
            query_before(query_obj, now, [], resolve, reject);
        });
    },
    find_delay: function (query_obj, callback_ok, callback_fail, delay_ms, try_count) {
        setTimeout(function () {
            TabUtil.find(query_obj, callback_ok, callback_fail, try_count);
        }, TabUtil.get_random_delay_ms(delay_ms));
    },
    copy_record: function (record) {
        var RecordObject = AV.Object.extend(record.className);
        var r = new RecordObject();
        for (var key in record.attributes) {
            if (! record.attributes.hasOwnProperty(key))
                continue;
            r.set(key, record.get(key));
        }
        return r;
    },
    unmerge_records: function (records, merged_field) {
        var new_records = [];

        if (! (records instanceof Array)) {    // 如果传递的是单一的record对象, 将其变为 list.
            records = [records];
        }
        if (! records || records.length == 0) {
            return new_records;
        }

        var first_record = records[0];

        merged_field = merged_field || TabUtil._merged_field;
        try {
            records.forEach(function (x) {
                if (! merge_list instanceof Array)
                    throw (new Error("typeof (merge_field: " + merged_field + ") must be list !"));

                var merge_list = x.get(merged_field);
                if (! merge_list) {
                    new_records.push(x);
                    return;
                }

                merge_list.forEach(function (x) {
                    if (typeof (x) != 'object')
                        throw (new Error("typeof (item of: " + merged_field + ") must be object !"));

                    var new_record = TabUtil.copy_record(first_record);
                    new_record.set(merged_field, undefined);
                    new_record.set(TabUtil._merged_index_field, undefined);

                    for (var key in x) {
                        if (! x.hasOwnProperty(key))
                            continue;
                        new_record.set(key, x[key]);
                    }
                    new_records.push(new_record);
                })
            });
            return new_records;
        } catch (e) {
            throw e;
        }
    },
    save_records_with_merge: function (records, fields_to_merge, fields_common, merged_field, max_merged_num) {
        var merged_list = [];
        max_merged_num = max_merged_num || TabUtil._max_merged_num;

        if (! (records instanceof Array))
            records = [records];
        if (records.length == 0)
            return new Promise(function(resolve, reject) {
                resolve(undefined);
            });

        var first_record = records[0];
        var class_name = first_record.className;
        var record_list = [];


        if (! fields_to_merge) {
            fields_to_merge = TablesMeta.get_merge_fields(class_name);
        }
        if (! fields_common) {
            fields_common = TablesMeta.get_common_fields(class_name);
        }

        if (fields_to_merge.length == 0) {
            return new Promise(function(resolve, reject) {
                AV.Object.saveAll(records, resolve, reject);    // 不需要合并字段, 直接全部保存
                // reject(new Error("Not get parameter: fields_to_merge"));
            });
        }

        merged_field = merged_field || TabUtil._merged_field;
        records.forEach(function (record) {
            var merged_values = {};
            fields_to_merge.forEach(function (field) {
                merged_values[field] = record.get(field);
            });
            merged_list.push(merged_values);
        });

        function clean_fields(record) {
            fields_to_merge.forEach(function (field) {
                record.set(field, undefined);
            });
        }

        var func_cat_merged_list = function (record, merged_list, merged_index) {
            // put records to save in: record_list;
            if (! record) {
                record = TabUtil.copy_record(first_record);    // copy from first one.
                record.set(merged_field, []);
                record.set(MERGED_INDEX_FIELD, merged_index)
            }
            clean_fields(record);    // set merged fields to null.
            var this_merged_list = record.get(merged_field) || [];
            var can_cat_num = max_merged_num - this_merged_list.length;
            can_cat_num = can_cat_num < 0 ? 0 : can_cat_num;
            var cat_merged_list = merged_list.slice(0, can_cat_num);
            var left_merged_list = merged_list.slice(cat_merged_list.length);

            this_merged_list = this_merged_list.concat(cat_merged_list);
            record.set(merged_field, this_merged_list);
            record_list.push(record);
            if (left_merged_list.length > 0) {
                func_cat_merged_list(null, left_merged_list, merged_index + 1);
            }
        };

        var query_last_merge = new AV.Query(class_name);
        fields_common.forEach(function (field) {
            query_last_merge.equalTo(field, first_record.get(field));
        });
        query_last_merge.exists(merged_field);
        query_last_merge.descending(TabUtil._merged_index_field);
        return new Promise(function(resolve, reject) {
            reject = reject || TabUtil.default_reject;
            query_last_merge.first().then(function (record) {
                try {
                    var merged_index = record ? record.get(MERGED_INDEX_FIELD) : 0;
                    func_cat_merged_list(record, merged_list, merged_index);
                    AV.Object.saveAll(record_list, resolve, reject);    // 全部保存
                } catch (e) {
                    reject(e);
                }
            });
        });

    }
};


module.exports = TabUtil;