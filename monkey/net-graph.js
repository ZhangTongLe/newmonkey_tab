/**
 * Created by kangtian on 16/9/16.
 */

var AV = require('../lib/tab-login');
var HttpUtil = require('../lib/http-util');
var TabUtil = require('../lib/tab-util');
var MonkeyEvent = require('./monkey-event');


function event_history_do_filter(req, res, next) {
    var product = null, version = null, task_id = null;
    if (req.body) {
        product = req.body['product'];
        version = req.body['version'];
        task_id = req.body['task_id'];
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

    TabUtil.find(query, function (records) {
        records.forEach(function (r, index, records) {
            r.set('event_entity', MonkeyEvent.get_event_entity(r));
            r.set('event_identify', MonkeyEvent.get_event_identify(r));
            r.set('event_entity_identify', MonkeyEvent.get_event_entity_identify(r));
        });
        records.shift();
        var resp = {
            status: 'ok',
            data: records,
            para: {
                task_id: task_id
            }
        };
        HttpUtil.resp_json(res, resp);
    }, function (error) {
        throw error;
    }).catch(next);
}


function activity_event_node_edge(req, res, next) {
    var product = null, version = null, task_id = null;
    if (req.body) {
        product = req.body['product'];
        version = req.body['version'];
        task_id = req.body['task_id'];
    }

    get_activity_event_net_info(product, version, task_id, function (info) {
        var resp = {
            status: 'ok',
            data: info
        };
        HttpUtil.resp_json(res, resp);
    }, next);
}


function get_activity_event_net_info(product, version, task_id, callback_ok, callback_fail) {
    var query = new AV.Query('EventHistory');
    if (product)
        query.equalTo('product', product);
    if (version)
        query.equalTo('version', version);
    if (task_id)
        query.equalTo('task_id', task_id);
    TabUtil.find_all(query, function (records) {
        var node_map = {};
        var node_index = 0;
        var edge_map = {};
        var edge_index = 0;

        records.forEach(function (r) {
            r.set('event_entity', MonkeyEvent.get_event_entity(r));
            r.set('event_identify', MonkeyEvent.get_event_identify(r));
            r.set('event_entity_identify', MonkeyEvent.get_event_entity_identify(r));

            if (node_map[r.get('pre_activity')] == undefined){
                node_map[r.get('pre_activity')] = {id: node_index ++, title: r.get('pre_activity'), label: r.get('pre_activity'), value: 1};
            }
            if (node_map[r.get('next_activity')] == undefined){
                node_map[r.get('next_activity')] = {id: node_index ++, title: r.get('next_activity'), label: r.get('next_activity'), value: 1};
            }

            if (edge_map[r.get('event_identify')] == undefined){
                edge_map[r.get('event_identify')] = {
                    id: edge_index ++, title: r.get('event_identify'), value: 1,
                    from: node_map[r.get('pre_activity')].id, to: node_map[r.get('next_activity')].id, arrows: 'to',
                    seq_no: r.get('seq_no')
                };
            } else {
                edge_map[r.get('event_identify')].value += 1;
            }

            node_map[r.get('pre_activity')].value += 1;
            node_map[r.get('next_activity')].value += 1;
        });

        var res = {
            node_map: node_map,
            edge_map: edge_map
        };
        callback_ok(res);
    }, callback_fail)
}


function net_graph_activity_full_screen(req, res, next) {
    var task_id, status, errMsg;
    if (req.query) {
        task_id = req.query.task_id;
        status = req.query.status || 0;
        errMsg = req.query.errMsg;
    }
    var para = {
        task_id: task_id
    };
    res.render('monkey/activity-network-full-screen', {
        title: 'Event History',
        user: req.currentUser,
        para: para,
        status: status,
        errMsg: errMsg
    });
}


var NetGraph = {
    event_history_do_filter: event_history_do_filter,
    activity_event_node_edge: activity_event_node_edge,
    net_graph_activity_full_screen: net_graph_activity_full_screen
};


module.exports = NetGraph;
