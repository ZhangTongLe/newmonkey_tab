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
    new AV.Query('TaskMeta').equalTo('task_id', task_id).first().then(function (task) {
        var product = task.get('product');
        get_sm_records(product, function (sm_records) {
            stat_all_with_task_meta(sm_records, {
                task_id: task_id
            }, callback, callback_fail, extra_para)
        }, callback_fail)
    });
}


function stat_product_ver_use_task_meta(product, version, callback, callback_fail, extra_para){
    get_sm_records(product, function (sm_records) {
        stat_all_with_task_meta(sm_records, {
            product: product,
            version: version
        }, callback, callback_fail, extra_para)
    }, callback_fail)
}


function get_sm_records(product, callback, callback_fail) {
    var event_query = new AV.Query('StatusMap')
        .equalTo('product', product)
        .greaterThan('createdAt', new Date(new Date() - 3600000 * 24 * 15));    // 最近半个月
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
        total_num = total_num >= cover_num ? total_num : cover_num;
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


function stat_all_with_task_meta(sm_records, filter_dict, callback, callback_fail, extra_para) {
    var sm_activity_set = new Set();

    extra_para = extra_para == undefined ? {} : extra_para;

    function find_activity_list(product, when_ok, when_fail) {
        if (product) {
            var product_query = new AV.Query('ProductMeta');
            product_query.equalTo('product', product);
            product_query.descending('version');
            TabUtil.find(product_query, function (versions) {
                if (versions.length > 0) {
                    var l = versions[0].get('activity_list');
                    if (typeof l == 'object' && l.length > 0) {
                        l.forEach(function (r) {
                            sm_activity_set.add(r);
                        })
                    }
                }
                when_ok()
            }, when_fail);
        } else {
            when_ok();
        }
    }

    function do_stat() {
        if (extra_para['stat_by_step']) {
            var eh_query = new AV.Query('EventHistory');

            if (filter_dict.task_id)
                eh_query.equalTo('task_id', filter_dict.task_id);
            if (filter_dict.product)
                eh_query.contains('product', filter_dict.product);
            if (filter_dict.version)
                eh_query.contains('version', filter_dict.version);

            TabUtil.find_all(eh_query, function (records) {
                var stat_list = [];
                var sample_num = extra_para['sample_num'] ? extra_para['sample_num'] : 15;    // default 15.
                var step = records.length / sample_num;
                step = step >= 1 ? step : 1;
                var step_start_time = null;
                var end;

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

                for (var pos = step; pos < records.length + step - 1; pos += step) {
                    step_start_time = records[0].createdAt;
                    end = parseInt(pos);
                    end = end > records.length ? records.length : end;
                    var step_records = records.slice(0, end);
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
                        stat_all_with_eh_and_sm([step_meta], sm_records, sm_activity_set, gather_result, callback_fail);
                    } catch (e) {
                        console.error(e);
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

    }

    find_activity_list(filter_dict.product, do_stat, callback_fail);
}

var Stat = {
    stat_acr: stat_acr,
    stat_wcr: stat_wcr,
    stat_ecr: stat_ecr,
    stat_all_in_one: stat_all_in_one,
    stat_task_use_task_meta: stat_task_use_task_meta,
    stat_product_ver_use_task_meta: stat_product_ver_use_task_meta
};

module.exports = Stat;

