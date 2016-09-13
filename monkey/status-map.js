/**
 * Created by kangtian on 16/9/11.
 */

var AV = require('../lib/tab-login');
var G = require('../config/global');
var HttpUtil = require('../lib/http-util');


function sync_status_map(event_records) {
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
        if (r.get('next_activity')){
            status_map.set('next_activity', r.get('next_activity'));
        }
        else{
            var query_next = new AV.Query('EventHistory')
                .equalTo('task_id', r.get('task_id'))
                .equalTo('seq_no', r.get('seq_no') + 1);
            query_next.find().then(function (records) {
                if (records.length > 0)
                    status_map.set('next_activity', records[0].get('pre_activity'));
                else
                    status_map.set('next_activity', 'END_ACTIVITY');
                // save.
                status_map.save().then(function () {
                    console.log('save success.');
                }, function (error) {
                    if (error.message.indexOf('A unique field was given a value that is already taken.') > 0)
                        console.log(error.message);
                    else if (error.message.indexOf('Too many requests.') > 0){
                        setTimeout(function () {
                            status_map.save();
                        }, Math.random() * 3000 + 100);
                    }
                    else
                        throw (error);
                })
            }, function (error) {
                console.error(error)
            })
        }
    });
}


function reply_to_status_map_page(req, res, next) {
    var status = 0;
    var errMsg = null;
    if (req.query) {
        status = req.query.status || 0;
        errMsg = req.query.errMsg;
    }
    var query = new AV.Query('StatusMap');
    var product_list = ['RandomApp_8001', '手机QQ(Android)', 'Random App'];
    var version_list = ['1.0.0', '1.0.1', '6.5.8'];
    query.equalTo('event', 'MonkeyUiEvent');
    query.limit(G.TAB_LIMIT);
    query.find({sessionToken: req.sessionToken}).then(function (results) {
        res.render('stat/status-map', {
            title: 'NewMonkey 执行路径统计',
            user: req.currentUser,
            records: results,
            product_list: product_list,
            version_list: version_list,
            status: status,
            errMsg: errMsg
        });
    }, function (error) {
        console.error(error);
    }).catch(next);
}

function status_map_do_filter(req, res, next) {
    var product = null, version = null, task_id = null;
    if (req.body) {
        product = req.body['product'];
        version = req.body['version'];
        task_id = req.body['task_id'];
    }
    var query = new AV.Query('StatusMap');
    query.limit(G.TAB_LIMIT);
    if (product)
        query.equalTo('product', product);
    if (version)
        query.equalTo('version', version);
    if (task_id)
        query.equalTo('task_id', task_id);
    query.find({sessionToken: req.sessionToken}).then(function (records) {
        var resp = {
            status: 'ok',
            data: records
        };
        HttpUtil.resp_json(res, resp);
    }, function (error) {
        throw error;
    }).catch(next);
}


var StatusMap = {
    sync_status_map: sync_status_map,
    reply_to_status_map_page: reply_to_status_map_page,
    status_map_do_filter: status_map_do_filter
};


module.exports = StatusMap;
