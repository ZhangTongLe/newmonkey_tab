/**
 * Created by kangtian on 16/9/11.
 */

var AV = require('../lib/tab-login');
var G = require('../config/global');
var HttpUtil = require('../lib/http-util');
var TabUtil = require('../lib/tab-util');
var MonkeyEvent = require('./monkey-event');


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
    var StatusMap = AV.Object.extend('StatusMap');
    var status_map = new StatusMap();
    status_map.set('product', r.get('product'));
    status_map.set('version', r.get('version'));
    status_map.set('event_name', r.get('event_name'));
    status_map.set('event_data', r.get('event_data'));
    status_map.set('event_entity', MonkeyEvent.get_event_entity(r));
    status_map.set('event_identify', MonkeyEvent.get_event_identify(r));
    status_map.set('event_entity_identify', MonkeyEvent.get_event_entity_identify(r));
    status_map.set('next_activity', r.get('pre_activity'));    // 使用 afterSave 调用方式, 需要 seq_no 向前搜索
    if (r.get('next_activity')){
        status_map.set('next_activity', r.get('next_activity'));
        TabUtil.save(status_map);
    }
    else{
        var query_pre = new AV.Query('EventHistory')
            .equalTo('task_id', r.get('task_id'))
            .equalTo('seq_no', r.get('seq_no') + 1);
        TabUtil.find(query_pre, function (records) {
            if (records.length > 0)
                status_map.set('pre_activity', records[0].get('pre_activity'));

            // save.
            TabUtil.save(status_map);
        })
    }
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

    // query product
    var product_query = new AV.Query('EnumMeta').equalTo('key_first', 'product').equalTo('key_second', null);
    TabUtil.find(product_query, function (records) {
        records.forEach(function (r) {
            product_list.push(r.get('value_str'));
        });

        // query version
        var product_version_query = new AV.Query('EnumMeta').equalTo('key_first', 'product_version');
        TabUtil.find(product_version_query, function (records) {
            records.forEach(function (r) {
                version_list.push(r.get('value_str'));
            });

            // finish query ...
            when_meta_info_ok();
        });
    });

    function when_meta_info_ok() {
        var query = new AV.Query('StatusMap');
        query.limit(G.TAB_LIMIT);
        query.find({sessionToken: req.sessionToken}).then(function (results) {
            res.render('monkey/status-map', {
                title: 'Status Map',
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
}

function status_map_do_filter(req, res, next) {
    var product = null, version = null, task_id = null;
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
    sync_one_event_record: sync_one_event_record,
    reply_to_status_map_page: reply_to_status_map_page,
    status_map_do_filter: status_map_do_filter
};


module.exports = StatusMap;
