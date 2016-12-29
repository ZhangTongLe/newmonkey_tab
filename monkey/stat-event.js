/**
 * Created by kangtian on 16/9/13.
 *
 * Note:
 *     acr: activity coverage rate.
 *     wcr: widget coverage rate.
 *     ecr: event coverage rate.
 */

var AV = require('../lib/tab-login');
var DsUtil = require('../lib/ds_util');
var TabUtil = require('../lib/tab-util');
var MonkeyEvent = require('./monkey-event');


function get_records_of_task(task_id, func_when_ok, callback, error_callback){
    var event_query = new AV.Query('EventHistory');
    event_query.equalTo('task_id', task_id);
    TabUtil.find_all(event_query, function (records) {
        var product = records[0].get('product');
        var version = records[0].get('version');
        func_when_ok(product, version, records, callback);
    }, function (error) {
        if (error_callback)
            error_callback(error);
        else
            throw error
    });
}


function stat_all_in_one(task_id, callback, error_callback){
    get_records_of_task(task_id, function (product, version, event_records, callback) {
        get_sm_records(product, function (sm_records) {
            var stat = {};
            stat_acr_with_events(sm_records, event_records, function (acr_res) {
                stat.acr = acr_res;
                stat_wcr_with_events(sm_records, event_records, function (wcr_res) {
                    stat.wcr = wcr_res;
                    stat_ecr_with_events(sm_records, event_records, function (ecr_res) {
                        stat.ecr = ecr_res;
                        callback(stat);
                    });
                });
            });
        })
    }, callback, error_callback);
}


function stat_task_use_task_meta(task_id, callback, callback_fail, extra_para){
    var query = new AV.Query('TaskMeta');    // TODO: 减少 query 请求, url 附上 product.
    query.equalTo('task_id', task_id).first().then(function (task) {
        var product = task.get('product'), version = task.get('version');
        get_sm_records(product, function (sm_records) {
            var filter_dict = {
                task_id: task_id,
                task_product: product,    // filter_dict 会用于表的 select 用, 不能使用 product 或者 version 作为 key, 但同时需要传递产品和版本信息, 所以加了 task 前缀.
                task_version: version
            };
            stat_all_with_task_meta(sm_records, filter_dict, callback, callback_fail, extra_para)
        }, callback_fail)
    });
}


function stat_product_ver_use_task_meta(product, version, callback, callback_fail, extra_para){
    get_sm_records(product, function (sm_records) {
        var filter_dict = {
            product: product,
            version: version
        };
        stat_all_with_task_meta(sm_records, filter_dict, callback, callback_fail, extra_para)
    }, callback_fail)
}


function stat_product_ver_use_status_map(product, version, callback, callback_fail, extra_para){
    get_sm_records(product, function (sm_records) {
        var filter_dict = {
            product: product,
            version: version
        };
        stat_all_with_status_map(sm_records, filter_dict, callback, callback_fail, extra_para)
    }, callback_fail)
}


function get_sm_records(product, callback, callback_fail) {
    var event_query = new AV.Query('StatusMap')
        .equalTo('product', product)
        .greaterThan('createdAt', new Date(new Date() - 3600000 * 24 * 30));    // 最近一个月
    TabUtil.find_all(event_query, function (sm_records) {
        callback(sm_records);
    }, callback_fail)
}

function stat_acr(task_id, callback, error_callback){
    get_records_of_task(task_id, function (product, version, event_records, callback) {
        get_sm_records(product, function (sm_records) {
            stat_acr_with_events(sm_records, event_records, callback);
        })
    }, callback, error_callback);
}


function stat_acr_with_events(sm_records, event_records, callback) {
    var sm_activity_set = new Set();
    var e_activity_set = new Set();
    var cover_num = 0;

    sm_records.forEach(function (s) {
        sm_activity_set.add(s.get('pre_activity'));
        sm_activity_set.add(s.get('next_activity'));
    });

    event_records.forEach(function (e) {
        e_activity_set.add(e.get('pre_activity'));
        if (e.get('next_activity'))
            e_activity_set.add(e.get('next_activity'));
    });

    e_activity_set.forEach(function (activity) {
        cover_num += 1;    // 强行保持一致
        if (sm_activity_set.has(activity)){
            // cover_num += 1;
        }
    });

    var cover_activity_list = [];
    e_activity_set.forEach(function (e) {cover_activity_list.push(e)});

    var sm_activity_list = [];
    sm_activity_set.forEach(function (e) {sm_activity_list.push(e)});

    if (callback != undefined){
        var total_num = sm_activity_set.size;
        total_num = total_num >= cover_num ? total_num : cover_num;         //修改
        var coverage_rate = total_num == 0 ? 0.0 : cover_num / parseFloat(total_num);
        var acr_res = {
            coverage_rate: coverage_rate, total_num: total_num, cover_num: cover_num,
            cover_list: cover_activity_list,
            total_list: sm_activity_list
        };
        callback(acr_res);
    }
}


function stat_wcr(task_id, callback, error_callback){
    get_records_of_task(task_id, function (product, version, event_records, callback) {
        get_sm_records(product, function (sm_records) {
            stat_wcr_with_events(sm_records, event_records, callback);
        })
    }, callback, error_callback);
}

function stat_wcr_with_events(sm_records, event_records, callback) {
    var sm_widget_set = new Set();
    var e_widget_set = new Set();
    var cover_num = 0;

    sm_records.forEach(function (s) {
        sm_widget_set.add(s.get('event_entity_identify'));
    });

    event_records.forEach(function (e) {
        e_widget_set.add(MonkeyEvent.get_event_entity_identify(e));
    });

    e_widget_set.forEach(function (widget) {
        cover_num += 1;    // 强行保持一致
        if (sm_widget_set.has(widget)){
            // cover_num += 1;
        }
    });

    var cover_widget_list = [];
    e_widget_set.forEach(function (e) {cover_widget_list.push(e)});

    var sm_widget_list = [];
    sm_widget_set.forEach(function (e) {sm_widget_list.push(e)});


    if (callback != undefined){
        var total_num = sm_widget_set.size;
        total_num = total_num >= cover_num ? total_num : cover_num;
        var coverage_rate = total_num == 0 ? 0.0 : cover_num / parseFloat(total_num);
        var acr_res = {
            coverage_rate: coverage_rate, total_num: total_num, cover_num: cover_num,
            cover_list: cover_widget_list,
            total_list: sm_widget_list
        };
        callback(acr_res);
    }
}


function stat_ecr(task_id, callback, error_callback){
    get_records_of_task(task_id, function (product, version, event_records, callback) {
        get_sm_records(product, function (sm_records) {
            stat_ecr_with_events(sm_records, event_records, callback);
        })
    }, callback, error_callback);
}

function stat_ecr_with_events(sm_records, event_records, callback) {
    var sm_event_set = new Set();
    var e_event_set = new Set();
    var cover_num = 0;

    sm_records.forEach(function (s) {
        sm_event_set.add(s.get('event_identify'));
    });

    event_records.forEach(function (e) {
        e_event_set.add(MonkeyEvent.get_event_identify(e));
    });

    e_event_set.forEach(function (event) {
        cover_num += 1;    // 强行保持一致
        if (sm_event_set.has(event)){
            // cover_num += 1;
        }
    });

    var cover_event_list = [];
    e_event_set.forEach(function (e) {cover_event_list.push(e)});

    var sm_event_list = [];
    sm_event_set.forEach(function (e) {sm_event_list.push(e)});

    if (callback != undefined){
        var total_num = sm_event_set.size;
        total_num = total_num >= cover_num ? total_num : cover_num;
        var coverage_rate = total_num == 0 ? 0.0 : cover_num / parseFloat(total_num);
        var acr_res = {
            coverage_rate: coverage_rate, total_num: total_num, cover_num: cover_num,
            cover_list: cover_event_list,
            total_list: sm_event_list
        };
        callback(acr_res);
    }
}


function stat_all_with_eh_and_sm(tm_records, sm_records, sm_activity_set, when_ok, when_fail) {
    var activity_list = [], widget_list = [], event_list = [];
    var sm_widget_set = new Set();
    var sm_event_set = new Set();

    if (tm_records.length > 0){
        sm_records.forEach(function (s) {
            sm_activity_set.add(s.get('pre_activity'));
            sm_activity_set.add(s.get('next_activity'));
            sm_widget_set.add(s.get('event_entity_identify'));
            sm_event_set.add(s.get('event_identify'));
        });

        tm_records.forEach(function (task_meta) {
            activity_list = activity_list.concat(task_meta.get('activity_list'));
            widget_list = widget_list.concat(task_meta.get('widget_list'));
            event_list = event_list.concat(task_meta.get('event_list'));
        });

        activity_list = DsUtil.list_distinct(activity_list);
        widget_list = DsUtil.list_distinct(widget_list);
        event_list = DsUtil.list_distinct(event_list);

        var func_stat = function (cover_num, all_num, cover_list, total_list) {
            all_num = all_num > cover_num ? all_num : cover_num;
            return {
                coverage_rate: all_num == 0 ? 0.0 : cover_num / parseFloat(all_num),
                total_num: all_num, cover_num: cover_num,
                cover_list: cover_list,
                total_list: total_list
            };
        };

        var stat = {
            acr: func_stat(activity_list.length, sm_activity_set.size, activity_list, DsUtil.set2list(sm_activity_set)),
            wcr: func_stat(widget_list.length, sm_widget_set.size, widget_list, DsUtil.set2list(sm_widget_set)),
            ecr: func_stat(event_list.length, sm_event_set.size, event_list, DsUtil.set2list(sm_event_set))
        };

        when_ok(stat);
    } else {
        var e = new Error('error at stat_all_with_eh_and_sm, task-mata not ready');
        console.error(e);
        when_fail(e);
    }
}

function stat_all_with_eh_and_sm_2(tm_records, sm_activity_set, sm_widget_set, sm_event_set,  extra_para, when_ok, when_fail) {
    var activity_list = [], widget_list = [], event_list = [];
    // var sm_widget_set = new Set();
    // var sm_event_set = new Set();

    if (tm_records.length > 0){
        console.log('tm_records length is %d', tm_records.length);
        console.log(typeof(tm_records));
        if (extra_para['stat_by_step']){
            tm_records.forEach(function (r) {
                activity_list = activity_list.concat(r.get('activity_list'));
                widget_list = widget_list.concat(r.get('widget_list'));
                event_list = event_list.concat(r.get('event_list'));
            });
        } else {
            tm_records.forEach(function (r) {
                activity_list.push(r.get('pre_activity'));
                widget_list.push(MonkeyEvent.get_event_entity_identify(r));
                event_list.push(MonkeyEvent.get_event_identify(r));
            });
        }
        activity_list = DsUtil.list_distinct(activity_list);
        widget_list = DsUtil.list_distinct(widget_list);
        event_list = DsUtil.list_distinct(event_list);

        console.log('activity_list length is %d', activity_list.length);
        console.log(activity_list[0]);

        var func_stat = function (cover_num, all_num, cover_list, total_list) {
            var total_num_value = all_num > cover_num ? all_num : cover_num;
            return {
                coverage_rate: total_num_value == 0 ? 0.0 : cover_num / parseFloat(total_num_value),
                cover_num: cover_num,
                all_num: all_num,
                total_num: total_num_value,
                cover_list: cover_list,
                total_list: total_list
            };
        };

        var stat = {
            acr: func_stat(activity_list.length, sm_activity_set.size, activity_list, DsUtil.set2list(sm_activity_set)),
            wcr: func_stat(widget_list.length, sm_widget_set.size, widget_list, DsUtil.set2list(sm_widget_set)),
            ecr: func_stat(event_list.length, sm_event_set.size, event_list, DsUtil.set2list(sm_event_set))
        };

        when_ok(stat);
    } else {
        var e = new Error('error at stat_all_with_eh_and_sm, task-mata not ready');
        console.error(e);
        when_fail(e);
    }
}

function find_activity_list(filter_dict, all_activity_set, when_ok, when_fail) {
    try {
        var product = filter_dict.product || filter_dict.task_product;
        var version = filter_dict.version || filter_dict.task_version;

        if (product) {
            var product_query = new AV.Query('ProductMeta');          // 为什么要从productmeta中取数据
            product_query.equalTo('product', product);
            product_query.descending('version');
            console.log(product_query);
            TabUtil.find(product_query, function (versions) {
                if (versions.length > 0) {
                    var l = versions[0].get('activity_list');
                    if (typeof l == 'object' && l.length > 0) {
                        l.forEach(function (r) {
                            all_activity_set.add(r);
                        })
                    }
                }
                when_ok()
            }, when_fail);
        } else {
            when_ok();
        }
    } catch (e) {
        when_fail(e);
    }

}


function stat_all_with_task_meta(sm_records, filter_dict, callback, callback_fail, extra_para) {
    try {
        var sm_activity_set = new Set();
        var sm_widget_set = new Set();
        var sm_event_set = new Set();
        extra_para = extra_para == undefined ? {} : extra_para;

        function do_stat() {
            try {
                if (extra_para['stat_by_step']) {
                    var eh_query = new AV.Query('EventHistory');

                    console.log('stat_all_with_task_meta: filter_dict: ' + JSON.stringify(filter_dict));
                    if (filter_dict.task_id)
                        eh_query.equalTo('task_id', filter_dict.task_id);
                    if (filter_dict.product)
                        eh_query.contains('product', filter_dict.product);
                    if (filter_dict.version)
                        eh_query.contains('version', filter_dict.version);
                    eh_query.ascending('event_time');

                    console.log('stat_all_with_task_meta: find all start.');
                    TabUtil.find_all(eh_query, function (records) {
                        records.forEach(function (r) {
                            sm_activity_set.add(r.get('pre_activity'));
                            sm_activity_set.add(r.get('next_activity'));
                            sm_widget_set.add(MonkeyEvent.get_event_entity_identify(r));
                            sm_event_set.add(MonkeyEvent.get_event_identify(r));
                        });
                        sm_records.forEach(function (s) {                    // 循环语句
                            sm_activity_set.add(s.get('pre_activity'));
                            sm_activity_set.add(s.get('next_activity'));
                            sm_widget_set.add(s.get('event_entity_identify'));
                            sm_event_set.add(s.get('event_identify'));
                        });
                        console.log('B页面 sm_activity_set length is %d', sm_activity_set.size);
                        console.log('stat_all_with_task_meta: find all ok.');
                        try {
                            var stat_list = [];
                            var sample_num = extra_para['sample_num'] ? extra_para['sample_num'] : 15;    // default 15.

                            function gather_result(stat) {
                                ['acr', 'wcr', 'ecr'].forEach(function (stat_type) {
                                    delete stat[stat_type]['cover_list'];
                                    delete stat[stat_type]['total_list'];
                                });

                                stat_list.push({
                                    step_start_time: step_start_time,
                                    stat: stat
                                })
                            }

                            var start_time = records[0].get('event_time'), end_time = records[records.length - 1].get('event_time');
                            start_time = new Date(start_time);
                            end_time = new Date(end_time);
                            var time_step = (end_time - start_time) / sample_num;
                            var time_pos = start_time.getTime();
                            var step_start_time = null;
                            // var flag = 0;

                            for (var i = 0; i < records.length; i += 1) {
                                step_start_time = new Date(records[i].get('event_time'));
                                if (step_start_time >= new Date(time_pos)) {
                                    // if (flag == 0){
                                    //     flag = 1;
                                    // }
                                    step_start_time = new Date(time_pos);    // 使用 records[i].createdAt 会导致时间轴数据分布不均匀。
                                    var step_records = records.slice(0, i);
                                    var step_meta = {activity_list: [], widget_list: [], event_list: [],
                                        get: function (key) {
                                            return this[key];
                                        }
                                    };
                                    step_records.forEach(function (r) {
                                        step_meta.activity_list.push(r.get('pre_activity'));
                                        step_meta.widget_list.push(MonkeyEvent.get_event_entity_identify(r));
                                        step_meta.event_list.push(MonkeyEvent.get_event_identify(r));
                                    });
                                    try {

                                        stat_all_with_eh_and_sm_2([step_meta], sm_activity_set, sm_widget_set, sm_event_set, extra_para, gather_result, callback_fail);

                                    } catch (e) {
                                        console.error(e);
                                        callback_fail(e);
                                    }
                                    time_pos += time_step;
                                } else {
                                    ;
                                }
                            }
                            callback(stat_list);
                        } catch (e) {
                            console.error(e);
                            callback_fail(e);
                        }
                    }, function (e) {
                        console.error(e);
                        callback_fail(e);
                    });
                } else {

                    var eh_query = new AV.Query('EventHistory');
                    if (filter_dict.task_id)
                        eh_query.equalTo('task_id', filter_dict.task_id);
                    if (filter_dict.product)
                        eh_query.contains('product', filter_dict.product);
                    if (filter_dict.version)
                        eh_query.contains('version', filter_dict.version);
                    eh_query.ascending('event_time');

                    TabUtil.find_all(eh_query, function (records) {
                        console.log('records length is %d', records.length);
                        records.forEach(function (r) {
                            sm_activity_set.add(r.get('pre_activity'));
                            sm_activity_set.add(r.get('next_activity'));
                            sm_widget_set.add(MonkeyEvent.get_event_entity_identify(r));
                            sm_event_set.add(MonkeyEvent.get_event_identify(r));
                        });
                        sm_records.forEach(function (s) {                    // 循环语句
                            sm_activity_set.add(s.get('pre_activity'));
                            sm_activity_set.add(s.get('next_activity'));
                            sm_widget_set.add(s.get('event_entity_identify'));
                            sm_event_set.add(s.get('event_identify'));
                        });
                        console.log('sm_activity_set length is %d', sm_activity_set.size);
                        console.log('in stat_all_with_eh_and_sm_2');                 // 进入下面方法的log
                        try {
                            stat_all_with_eh_and_sm_2(records, sm_activity_set, sm_widget_set, sm_event_set, extra_para, callback, callback_fail);
                        } catch (e) {
                            console.error(e);
                            callback_fail(e);
                        }

                    });
                }
            } catch (e) {
                console.error(e);
                callback_fail(e);
            }
        }
        // sm_activity_set 这里先将当前任务的所有 activity 算进去.
        find_activity_list(filter_dict, sm_activity_set, do_stat, callback_fail);
    } catch (e) {
        console.error(e);
        callback_fail(e);
    }

}


function stat_all_with_status_map(sm_records, filter_dict, callback, callback_fail, extra_para) {
    var sm_activity_set = new Set();
    extra_para = extra_para == undefined ? {} : extra_para;

    find_activity_list(filter_dict, sm_activity_set, do_stat, callback_fail);

    function do_stat() {
        try {
            if (extra_para['stat_by_step']) {
                var stat_list = [];
                var sample_num = extra_para['sample_num'] ? extra_para['sample_num'] : 15;    // default 15.

                var version_query = new AV.Query('StatusMap');
                if (filter_dict.product)
                    version_query.contains('product', filter_dict.product);
                if (filter_dict.version)
                    version_query.contains('version', filter_dict.version);
                // get status-map of product version.
                TabUtil.find_all(version_query, function (records) {
                    records.sort(function (a, b) {
                        return a.createdAt - b.createdAt;
                    });

                    var start_time = records[0].createdAt, end_time = records[records.length - 1].createdAt;
                    var time_step = (end_time - start_time) / sample_num;
                    var time_pos = start_time.getTime();
                    var step_start_time = null;

                    function gather_result(stat) {
                        ['acr', 'wcr', 'ecr'].forEach(function (stat_type) {
                            delete stat[stat_type]['cover_list'];
                            delete stat[stat_type]['total_list'];
                        });

                        stat_list.push({
                            step_start_time: step_start_time,
                            stat: stat
                        })
                    }

                    for (var i = 0; i < records.length; i += 1) {
                        step_start_time = records[i].createdAt;
                        if (step_start_time >= new Date(time_pos)) {
                            step_start_time = new Date(time_pos);    // 使用 records[i].createdAt 会导致时间轴数据分布不均匀。
                            var step_records = records.slice(0, i);
                            var step_meta = {activity_list: [], widget_list: [], event_list: [],
                                get: function (key) {
                                    return this[key];
                                }
                            };
                            step_records.forEach(function (r) {
                                step_meta.activity_list.push(r.get('pre_activity'));
                                step_meta.widget_list.push(r.get('event_entity_identify'));
                                step_meta.event_list.push(r.get('event_identify'));
                            });
                            try {
                                stat_all_with_eh_and_sm([step_meta], sm_records, sm_activity_set, gather_result, callback_fail);
                            } catch (e) {
                                console.error(e);
                            }
                            time_pos += time_step;
                        } else {
                            ;
                        }
                    }
                    callback(stat_list);
                });
            } else {
                var meta_query = new AV.Query('TaskMeta');

                if (filter_dict.task_id)
                    meta_query.equalTo('task_id', filter_dict.task_id);
                if (filter_dict.product)
                    meta_query.contains('product', filter_dict.product);
                if (filter_dict.version)
                    meta_query.contains('version', filter_dict.version);

                TabUtil.find_all(meta_query, function (meta_records) {
                    stat_all_with_eh_and_sm(meta_records, sm_records, sm_activity_set, callback, callback_fail);
                });
            }
        } catch (e) {
            console.error(e);
            callback_fail(e);
        }
    }
}


var Stat = {
    stat_acr: stat_acr,    // deprecated
    stat_wcr: stat_wcr,    // deprecated
    stat_ecr: stat_ecr,    // deprecated
    stat_all_in_one: stat_all_in_one,    // deprecated
    stat_task_use_task_meta: stat_task_use_task_meta,
    stat_product_ver_use_task_meta: stat_product_ver_use_task_meta,
    stat_product_ver_use_status_map: stat_product_ver_use_status_map
};

module.exports = Stat;

