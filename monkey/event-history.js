/**
 * Created by kangtian on 16/9/11.
 */

var AV = require('../lib/tab-login');
var G = require('../config/global');
var HttpUtil = require('../lib/http-util');

var StatusMap = require('./status-map');
var EnumMeta = require('./enum-meta');

var APP_DATA_EVENT_SYNC_TIME = 'event_history_sync_time';
var AppDate = AV.Object.extend('AppData');


function sync_event_history() {
    var query = new AV.Query('EventHistory');
    var kv_query = new AV.Query('AppData');

    kv_query.equalTo('key', APP_DATA_EVENT_SYNC_TIME).find().then(function (l) {
        var last_time = l.length > 0 ? l[0].get('value_str') : undefined;
        console.log('sync_status_map: last_time is '+last_time);
        last_time = last_time == undefined ? new Date(0): new Date(last_time);
        console.log('sync_status_map: do_sync.last_time is '+last_time);
        query.greaterThan('createdAt', last_time).addDescending('createdAt');
        query.limit(G.TAB_LIMIT);
        query.find().then(function (event_records) {
            StatusMap.sync_status_map(event_records);
            EnumMeta.sync_enum_meta(event_records);

            // save sync time.
            var kv_query = new AV.Query('AppData');
            var sync_time = event_records[0].createdAt;
            kv_query.equalTo('key', APP_DATA_EVENT_SYNC_TIME).find().then(function (records) {
                if (records.length > 0){
                    var r = records[0];
                    r.set('value_str', sync_time.toISOString());
                    r.save().then(null, function (error) {
                        console.error(error);
                    });
                }else{
                    var kv = new AppDate();
                    kv.set('key', APP_DATA_EVENT_SYNC_TIME);
                    kv.set('value_str', sync_time.toISOString());
                    kv.save().then(null, function (error) {
                        console.error(error);
                    });
                }
            })
        }, function (error) {
            console.error(error);
        });

    }, function (error) {
        console.error(error);
    });
}


function reply_to_sync_event_history(req, res, next) {
    sync_event_history();
    var resp = {
        status: 'ok'
    };
    HttpUtil.resp_json(res, resp);
}

var EventHistory = {
    sync_event_history: sync_event_history,
    reply_to_sync_event_history: reply_to_sync_event_history
};


module.exports = EventHistory;
