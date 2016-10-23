/**
 * Created by kangtian on 16/9/28.
 */

var AV = require('../lib/tab-login');
var HttpUtil = require('../lib/http-util');
var TabUtil = require('../lib/tab-util');
var G = require('../config/global');

var graph_type = {
    NET_GRAPH: 'net_graph'
};

function net_graph_upload(req, res, next) {
    var d = {};
    if (req.body) {
        d.name = req.body['name'];
        d.graph_type = req.body['graph_type'];
        try {
            if (req.body['data'])
                d.data = JSON.parse(req.body['data']);
            else
                d.data = {}
        } catch (e) {
            d.data = {};
            console.error(new Error("JSON.parse() failed"));
        }
    }

    var NetGraph = AV.Object.extend('NetGraph');
    var net_graph = new NetGraph();
    net_graph.set('name', d.name);
    net_graph.set('graph_type', d.graph_type);
    net_graph.set('data', d.data);
    TabUtil.save(net_graph, function (r) {
        var resp = {
            status: 'ok',
            data: {
                id: r.id,
                url: G.HOST + '/service/plotNetGraphShower?id=' + r.id
            }
        };
        HttpUtil.resp_json(res, resp);
    });
}


function get_graph_data(req, res, next) {
    try {
        var d = {};
        if (req.body) {
            d.id = req.body['id'];
        }

        var query = new AV.Query('NetGraph');
        query.equalTo('objectId', d.id);
        TabUtil.find(query, function (records) {
            if (records.length > 0) {
                var r = records[0];
                var resp = {
                    status: 'ok',
                    data: {
                        name: r.get('name'),
                        graph_type: r.get('graph_type'),
                        data: r.get('data')
                    }
                };
                HttpUtil.resp_json(res, resp);
            } else {
                HttpUtil.resp_json(res, {status: 'ok', data: {}});
            }
        });
    } catch (e) {
        console.error(e);
    }

}


function net_graph_shower(req, res, next) {
    var id, status, errMsg;
    if (req.query) {
        id = req.query.id;
        status = req.query.status || 0;
        errMsg = req.query.errMsg;
    }
    var para = {
        id: id
    };
    res.render('service/net-graph-shower', {
        title: 'Network Graph',
        user: req.currentUser,
        para: para,
        status: status,
        errMsg: errMsg
    });
}


var Plot = {
    get_graph_data: get_graph_data,
    net_graph_upload: net_graph_upload,
    net_graph_shower: net_graph_shower
};


module.exports = Plot;