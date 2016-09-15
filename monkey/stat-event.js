/**
 * Created by kangtian on 16/9/13.
 *
 * Note:
 *     arc: activity coverage rate.
 *
 */

var AV = require('../lib/tab-login');
var G = require('../config/global');
var HttpUtil = require('../lib/http-util');


function stat_acr(task_id, callback){
    var event_query = new AV.Query('EventHistory');
    event_query.equalTo('task_id', task_id);
    event_query.find().then(function (records) {
        if (records.length == 0){
            callback({coverage_rate: 0.0, total_num: 0, cover_num: 0});
        }

        var product = records[0].get('product');
        var version = records[0].get('version');
        stat_acr_with_events(product, version, records, callback);
    }, function (error) {
        throw error
    });
}


function stat_acr_with_events(product, version, event_records, callback) {
    var event_query = new AV.Query('StatusMap')
        .equalTo('product', product)
        .equalTo('version', version);
    event_query.limit(G.TAB_LIMIT);
    event_query.find().then(function (stats_records) {
        var sm_activity_set = new Set();
        var e_activity_set = new Set();
        var cover_num = 0;

        stats_records.forEach(function (s) {
            sm_activity_set.add(s.get('pre_activity'));
            sm_activity_set.add(s.get('next_activity'));
        });

        event_records.forEach(function (e) {
            e_activity_set.add(e.get('pre_activity'));
            if (e.get('next_activity'))
                e_activity_set.add(e.get('next_activity'));
        });

        e_activity_set.forEach(function (activity) {
            if (sm_activity_set.has(activity)){
                cover_num += 1;
            }
        });

        var cover_activity_list = [];
        e_activity_set.forEach(function (e) {
            cover_activity_list.push(e)
        });

        var sm_activity_list = [];
        sm_activity_set.forEach(function (e) {
            sm_activity_list.push(e)
        });

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

var Stat = {
    stat_acr: stat_acr
};

module.exports = Stat;


//
// stat_acr('2016-09-13_22:56:18.795301', function (res) {
//     console.log(res);
// });
