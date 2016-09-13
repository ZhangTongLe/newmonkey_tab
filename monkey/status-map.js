/**
 * Created by kangtian on 16/9/11.
 */

var AV = require('../lib/tab-login');
var http_util = require('../lib/http-util');

var APP_DATA_SM_SYNC_TIME = 'sm_sync_time';

var AppDate = AV.Object.extend('AppData');


function sync_status_map() {
    var query = new AV.Query('EventHistory');
    var kv_query = new AV.Query('AppData');
    kv_query.equalTo('key', APP_DATA_SM_SYNC_TIME).find().then(function (l) {
        var last_time = l.length > 0 ? l[0].get('value_str') : undefined;
        console.log('sync_status_map: last_time is '+last_time);
        do_sync(last_time);
    });

    function do_sync(last_time) {
        last_time = last_time == undefined ? new Date(0): new Date(last_time);
        console.log('sync_status_map: do_sync.last_time is '+last_time);
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
                if (r.get('next_activity'))
                    status_map.set('next_activity', r.get('next_activity'));
                else{
                    var query_next = new AV.Query('EventHistory')
                        .equalTo('task_id', r.get('task_id'))
                        .equalTo('seq_no', r.get('seq_no') + 1);
                    query_next.find().then(function (records) {
                        if (records.length > 0)
                            status_map.set('next_activity', records[0].get('pre_activity'));
                        else
                            status_map.set('next_activity', 'END_ACTIVITY');
                    }, function (error) {
                        console.error(error)
                    })
                }
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
            kv_query.equalTo('key', APP_DATA_SM_SYNC_TIME).find().then(function (records) {
                if (records.length > 0){
                    var r = records[0];
                    r.set('value_str', sync_time.toISOString());
                    r.save().then(null, function (error) {
                        console.error(error);
                    });
                }else{
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
    query.limit(50);
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
    }, function (err) {
        if (err.code === 101) {
            // 该错误的信息为：{ code: 101, message: 'Class or object doesn\'t exists.' }，说明 Todo 数据表还未创建，所以返回空的 Todo 列表。
            // 具体的错误代码详见：https://leancloud.cn/docs/error_code.html
            res.render('stat', {
                title: 'NewMonkey 执行路径统计',
                user: req.currentUser,
                records: [],
                status: status,
                errMsg: errMsg
            });
        } else {
            throw err;
        }
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
    if (product)
        query.equalTo('product', product);
    if (version)
        query.equalTo('version', version);
    if (task_id)
        query.equalTo('task_id', task_id);
    query.limit(50);
    query.find({sessionToken: req.sessionToken}).then(function (records) {
        var resp = {
            status: 'ok',
            data: records
        };
        http_util.resp_json(res, resp);
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
