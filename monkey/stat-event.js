/**
 * Created by kangtian on 16/9/13.
 *
 * Note:
 *     acr: activity coverage rate.
 *     wcr: widget coverage rate.
 *     ecr: event coverage rate.
 */

var AV = require('../lib/tab-login');
var G = require('../config/global');
var TabUtil = require('../lib/tab-util');
var MonkeyEvent = require('./monkey-event');


function get_records_of_task(task_id, func_when_ok, callback, error_callback){
    var event_query = new AV.Query('EventHistory');
    event_query.equalTo('task_id', task_id);
    TabUtil.find(event_query, function (records) {
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

function stat_acr(task_id, callback, error_callback){
    get_records_of_task(task_id, stat_acr_with_events, callback, error_callback);
}


function stat_acr_with_events(product, version, event_records, callback) {
    var event_query = new AV.Query('StatusMap')
        .equalTo('product', product);
    TabUtil.find(event_query, function (sm_records) {
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
            var coverage_rate = total_num == 0 ? 0.0 : cover_num / parseFloat(total_num);
            var acr_res = {
                coverage_rate: coverage_rate, total_num: total_num, cover_num: cover_num,
                cover_activity_list: cover_activity_list,
                sm_activity_list: sm_activity_list
            };
            callback(acr_res);
        }
    }, function (error) {
        throw error
    })
}


function stat_wcr(task_id, callback, error_callback){
    get_records_of_task(task_id, stat_wcr_with_events, callback, error_callback);
}

function stat_wcr_with_events(product, version, event_records, callback) {
    var event_query = new AV.Query('StatusMap')
        .equalTo('product', product)
        .equalTo('version', version);
    TabUtil.find(event_query, function (sm_records) {
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
            var coverage_rate = total_num == 0 ? 0.0 : cover_num / parseFloat(total_num);
            var acr_res = {
                coverage_rate: coverage_rate, total_num: total_num, cover_num: cover_num,
                cover_widget_list: cover_widget_list,
                sm_widget_list: sm_widget_list
            };
            callback(acr_res);
        }
    }, function (error) {
        throw error
    })
}


function stat_ecr(task_id, callback, error_callback){
    get_records_of_task(task_id, stat_ecr_with_events, callback, error_callback);
}

function stat_ecr_with_events(product, version, event_records, callback) {
    var event_query = new AV.Query('StatusMap')
        .equalTo('product', product)
        .equalTo('version', version);
    TabUtil.find(event_query, function (sm_records) {
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
            var coverage_rate = total_num == 0 ? 0.0 : cover_num / parseFloat(total_num);
            var acr_res = {
                coverage_rate: coverage_rate, total_num: total_num, cover_num: cover_num,
                cover_event_list: cover_event_list,
                sm_event_list: sm_event_list
            };
            callback(acr_res);
        }
    }, function (error) {
        throw error
    })
}

var Stat = {
    stat_acr: stat_acr,
    stat_wcr: stat_wcr,
    stat_ecr: stat_ecr
};

module.exports = Stat;

