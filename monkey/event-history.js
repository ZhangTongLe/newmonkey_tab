/**
 * Created by kangtian on 16/9/11.
 */

var AV = require('../lib/tab-login');
var G = require('../config/global');
var HttpUtil = require('../lib/http-util');
var TabUtil = require('../lib/tab-util');

var StatusMap = require('./status-map');
var EnumMeta = require('./enum-meta');
var TaskMeta = require('./task-meta');
var DsUtil = require('../lib/ds_util');

var APP_DATA_EVENT_SYNC_TIME = 'event_history_sync_time';
var AppDate = AV.Object.extend('AppData');


function sync_event_history(use_last_time) {
    var query = new AV.Query('EventHistory');
    var kv_query = new AV.Query('AppData');

    kv_query.equalTo('key', APP_DATA_EVENT_SYNC_TIME).find().then(function (l) {
        var last_time = l.length > 0 ? l[0].get('value_str') : undefined;
        last_time = last_time == undefined ? new Date(0): new Date(last_time);
        if (use_last_time)
            last_time = use_last_time;

        query.greaterThan('createdAt', last_time).addDescending('createdAt');
        query.limit(G.TAB_LIMIT);
        query.find().then(function (event_records) {
            StatusMap.sync_event_record_list(event_records);
            TaskMeta.sync_event_record_list(event_records);

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


function sync_one_event_record(r) {
    // 为了节省请求量, 已经将EventHistory多条记录打包为一条, 这里将其重新解包.
    var record_list = TabUtil.unmerge_records(r);
    StatusMap.sync_event_record_list(record_list);
    TaskMeta.sync_event_record_list(record_list);
}


function reply_to_event_history_page(req, res, next) {
    var status = 0;
    var errMsg = null;
    if (req.query) {
        status = req.query.status || 0;
        errMsg = req.query.errMsg;
    }
    var product_list = [];
    var version_list = [];
    var device_list = [];

    var query = new AV.Query('TaskMeta');
    query.select('product', 'version', 'device');
    query.descending('createdAt');
    TabUtil.find(query, function (records) {
        records.forEach(function (r) {
            product_list.push(r.get('product'));
            version_list.push(r.get('version'));
            device_list.push(r.get('device'));
        });
        product_list = DsUtil.list_distinct(product_list);
        version_list = DsUtil.list_distinct(version_list);
        device_list = DsUtil.list_distinct(device_list);
        when_meta_info_ok();
    });

    function when_meta_info_ok() {
        var query = new AV.Query('EventHistory');
        query.limit(G.TAB_LIMIT);
        TabUtil.find(query, function (results) {
            res.render('monkey/event-history', {
                title: 'Event History',
                user: req.currentUser,
                records: results,
                product_list: product_list,
                version_list: version_list,
                device_list: device_list,
                status: status,
                errMsg: errMsg
            });
        }).catch(next);
    }
}

function event_history_do_filter(req, res, next) {
    try{
        var product = null, version = null, task_id = null, distinct_task = null;
        if (req.body) {
            product = req.body['product'];
            version = req.body['version'];
            device = req.body['device'];
            task_id = req.body['task_id'];
            distinct_task = req.body['distinct_task'];
        }
        var query = new AV.Query('EventHistory');
        if (product)
            query.equalTo('product', product);
        if (version)
            query.equalTo('version', version);
        if (device)
            query.equalTo('device', device);
        if (task_id)
            query.equalTo('task_id', task_id);
        if (distinct_task)
            query.equalTo('seq_no', 0);
        query.descending('createdAt');

        query.find({sessionToken: req.sessionToken});
        TabUtil.find(query, function (records) {
            var resp = {
                status: 'ok',
                data: records
            };
            HttpUtil.resp_json(res, resp);
        }, function (error) {
            throw error;
        }).catch(next);
    } catch (e){
        console.error(e);
    }

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
    sync_one_event_record: sync_one_event_record,
    event_history_do_filter: event_history_do_filter,
    reply_to_event_history_page: reply_to_event_history_page,
    reply_to_sync_event_history: reply_to_sync_event_history
};


module.exports = EventHistory;

