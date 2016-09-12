/**
 * Created by kangtian on 16/9/11.
 */

var AV = require('../lib/tab-login');
var APP_DATA_SM_SYNC_TIME = 'sm_sync_time';

var AppDate = AV.Object.extend('AppData');


function sync_status_map() {
    var query = new AV.Query('EventHistory');
    var kv_query = new AV.Query('AppData');
    kv_query.equalTo('key', APP_DATA_SM_SYNC_TIME).find().then(function (l) {
        var last_time = l.length > 0 ? l[0].get('value_str') : undefined;
        do_sync(last_time);
    });

    function do_sync(last_time) {
        last_time = last_time == undefined ? new Date(0): new Date(last_time);
        query.greaterThan('createdAt', last_time).addDescending('createdAt');
        query.find().then(function (event_records) {
            if (event_records.length == 0)
                return;
            event_records.forEach(function (r, a, i) {
                var StatusMap = AV.Object.extend('StatusMap');
                var status_map = new StatusMap();
                status_map.set('product', r.get('product'));
                status_map.set('version', r.get('version'));
                status_map.set('event_name', r.get('event_name'));
                status_map.set('event_data', r.get('event_data'));
                status_map.set('pre_activity', r.get('pre_activity'));
                status_map.set('next_activity', r.get('next_activity'));
                status_map.save().then(function () {
                    console.log('save success.');
                }, function (error) {
                    if (error.message.indexOf('A unique field was given a value that is already taken.') == -1)
                        throw (error);
                    else
                        console.log(error.message);
                })
            });

            // save sync time.
            var kv_query = new AV.Query('AppData');
            var sync_time = event_records[0].createdAt;
            console.log('in');
            kv_query.equalTo('key', APP_DATA_SM_SYNC_TIME).find().then(function (records) {
                if (records.length > 0){
                    console.log('> 0');
                    var r = records[0];
                    r.set('value_str', sync_time.toISOString());
                    r.save().then(null, function (error) {
                        console.error(error);
                    });
                }else{
                    console.log('= 0');
                    var kv = new AppDate();
                    kv.set('key', APP_DATA_SM_SYNC_TIME);
                    kv.set('value_str', sync_time.toISOString());
                    kv.save().then(null, function (error) {
                        console.error(error);
                    });
                }
            })
        }, function (error) {
            console.error(error);
        });
    }

}


AV.Cloud.define('sync_status_map', function(request, response) {
    sync_status_map()
});

var StatusMap = {
    'sync_status_map': sync_status_map
};

module.exports = StatusMap;
