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
        device = req.body['device'];
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

    query.find({sessionToken: req.sessionToken});
    TabUtil.find(query, function (records) {
        records.forEach(function (r, index, records) {
            r.set('event_entity', MonkeyEvent.get_event_entity(r));
            r.set('event_identify', MonkeyEvent.get_event_identify(r));
            r.set('event_entity_identify', MonkeyEvent.get_event_entity_identify(r));
            if (index > 0){
                r.set('next_activity', records[index - 1].get('pre_activity'));
            }
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
    net_graph_activity_full_screen: net_graph_activity_full_screen
};


module.exports = NetGraph;
