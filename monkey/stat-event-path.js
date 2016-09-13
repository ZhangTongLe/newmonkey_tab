/**
 * Created by kangtian on 16/9/13.
 */

var AV = require('../lib/tab-login');

// acr = activity coverage rate

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
    var event_query = new AV.Query('StatusMap');
    event_query.equalTo('product', product);
    event_query.equalTo('version', version);
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
            e_activity_set.add(e.get('next_activity'));
        });

        e_activity_set.forEach(function (activity) {
            console.log(activity);
            if (sm_activity_set.has(activity)){
                cover_num += 1;
            }
        });

        console.log(cover_num);

        var total_num = sm_activity_set.length;
        if (callback){
            callback({coverage_rate: float(cover_num) / total_num, total_num: total_num, cover_num: cover_num});
        }
    }, function (error) {
        throw error
    })
}

stat_acr('2016-09-13_09:51:57.731581', function (info) {
    console.log(info);
});
