/**
 * Created by kangtian on 16/9/11.
 */

var AV = require('../lib/tab-login');
var G = require('../config/global');
var HttpUtil = require('../lib/http-util');
var TabUtil = require('../lib/tab-util');
var TabBridge = require('../service/tab-bridge');
var MonkeyEvent = require('./monkey-event');
var MonkeyUtil = require('./monkey-util');
var DsUtil = require('../lib/ds_util');

function sync_status_map(event_records) {
    if (event_records.length == 0)
        return;
    for (var i = 0; i < event_records.length; i ++){
        var r = event_records[i];
        setTimeout(function (r) {
            sync_one_event_record(r);
        }, i * 10, r);
    }
}

function sync_one_event_record(r) {
    try {
        var StatusMap = AV.Object.extend('StatusMap');
        var status_map = new StatusMap();
        var p;
        status_map.set('product', r.get('product'));
        status_map.set('version', r.get('version'));
        if (r.get('next_activity')) {
            status_map.set('event_name', r.get('event_name'));
            status_map.set('event_data', r.get('event_data'));
            status_map.set('event_identify', MonkeyEvent.get_event_identify(r));
            status_map.set('event_entity', MonkeyEvent.get_event_entity(r));
            status_map.set('event_entity_identify', MonkeyEvent.get_event_entity_identify(r));
            status_map.set('pre_activity', r.get('pre_activity'));
            status_map.set('next_activity', r.get('next_activity'));
            status_map.set('event_entity', MonkeyEvent.get_event_entity(r));
            status_map.set('is_activity_changed', r.get('is_activity_changed'));
            p = TabBridge.save_record_with_cache_inner(status_map);
        }
        else {
            status_map.set('next_activity', r.get('pre_activity'));    // 使用 afterSave 调用方式, 需要 seq_no 向前搜索
            MonkeyUtil.get_query_event_pre(r.get('task_id'), r.get('seq_no'), function (event_pre) {
                try {
                    if (event_pre) {
                        status_map.set('event_name', event_pre.get('event_name'));
                        status_map.set('event_data', event_pre.get('event_data'));
                        status_map.set('event_identify', MonkeyEvent.get_event_identify(event_pre));
                        status_map.set('event_entity', MonkeyEvent.get_event_entity(event_pre));
                        status_map.set('event_entity_identify', MonkeyEvent.get_event_entity_identify(event_pre));
                        status_map.set('pre_activity', event_pre.get('pre_activity'));
                        status_map.set('is_activity_changed', r.get('is_activity_changed'));
                        p = TabBridge.save_record_with_cache_inner(status_map);
                    }
                } catch (e) {
                    console.error(e);
                }
            });
        }
        p.then(function (records) {
            console.log('StatusMap: sync_one_event_record success. num: ' + records.length)
        }, function (e) {
            console.error(e);
        });
    } catch (e) {
        console.error(e);
    }

}


function sync_event_record_list(record_list) {
    return new Promise(function(resolve, reject) {
        try {
            if (record_list.length == 0) {
                return;
            }

            var to_save_list = [];
            var StatusMap = AV.Object.extend('StatusMap');
            record_list.forEach(function (r) {
                var status_map = new StatusMap();
                status_map.set('product', r.get('product'));
                status_map.set('version', r.get('version'));
                if (r.get('next_activity') != undefined) {
                    status_map.set('event_name', r.get('event_name'));
                    status_map.set('event_data', r.get('event_data'));
                    status_map.set('event_identify', MonkeyEvent.get_event_identify(r));
                    status_map.set('event_entity', MonkeyEvent.get_event_entity(r));
                    status_map.set('event_entity_identify', MonkeyEvent.get_event_entity_identify(r));
                    status_map.set('pre_activity', r.get('pre_activity'));
                    status_map.set('next_activity', r.get('next_activity'));
                    status_map.set('event_entity', MonkeyEvent.get_event_entity(r));
                    status_map.set('is_activity_changed', r.get('is_activity_changed'));
                    to_save_list.push(status_map);
                }
                else {
                    console.log('statusMap sync_event_record_list: next_activity is null or undefined.');
                    var e = new Error("EventHistory must has field: next_activity.");
                    console.error(e);
                    reject(e);
                }
            });
            TabBridge.save_record_with_cache_inner(to_save_list).then(function (info) {
                console.log('StatusMap save success.');
                resolve(info);
            }, function (e) {
                console.error(e);
                reject(e);
            });
        } catch (e) {
            console.error(e);
            reject(e);
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
    var product_list = [];
    var version_list = [];

    var query_tm = new AV.Query('TaskMeta');
    query_tm.select('product', 'version', 'device');
    query_tm.descending('createdAt');
    TabUtil.find(query_tm, function (records) {
        records.forEach(function (r) {
            product_list.push(r.get('product'));
            version_list.push(r.get('version'));
        });
        product_list = DsUtil.list_distinct(product_list);
        version_list = DsUtil.list_distinct(version_list);
        when_meta_info_ok();
    });

    function when_meta_info_ok() {
        var query_sm = new AV.Query('StatusMap');
        TabUtil.find(query_sm, function (results) {
            res.render('monkey/status-map', {
                title: 'Status Map',
                user: req.currentUser,
                records: results,
                product_list: product_list,
                version_list: version_list,
                status: status,
                errMsg: errMsg
            });
        });
    }
}

function status_map_do_filter(req, res, next) {
    var product = null, version = null;
    if (req.body) {
        product = req.body['product'];
        version = req.body['version'];
    }
    var query = new AV.Query('StatusMap');
    query.limit(G.TAB_LIMIT);
    if (product)
        query.equalTo('product', product);
    if (version)
        query.equalTo('version', version);
    TabUtil.find(query, function (records) {
        var resp = {
            status: 'ok',
            data: records
        };
        HttpUtil.resp_json(res, resp);
    });
}


var StatusMap = {
    sync_status_map: sync_status_map,
    sync_one_event_record: sync_one_event_record,
    sync_event_record_list: sync_event_record_list,
    reply_to_status_map_page: reply_to_status_map_page,
    status_map_do_filter: status_map_do_filter
};


module.exports = StatusMap;
