/**
 * Created by kangtian on 16/9/11.
 */

var AV = require('../lib/tab-login');
var TabUtil = require('../lib/tab-util');
var HttpUtil = require('../lib/http-util');
var DsUtil = require('../lib/ds_util');


function reply_to_task_list_page(req, res, next) {
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
        res.render('monkey/task-list', {
            title: 'Task List',
            user: req.currentUser,
            product_list: product_list,
            version_list: version_list,
            device_list: device_list,
            status: status,
            errMsg: errMsg
        });
    }
}

function get_task_list(req, res, next) {
    var product = null, version = null, task_id = null;
    if (req.query) {
        product = req.query['product'];
        version = req.query['version'];
        device = req.query['device'];
    }

    var query = new AV.Query('TaskMeta');
    if (product)
        query.equalTo('product', product);
    if (version)
        query.equalTo('version', version);
    if (device)
        query.equalTo('device', device);

    query.select('product', 'version', 'device', 'task_id');
    query.descending('createdAt');
    TabUtil.find(query).then(function (records) {
        HttpUtil.resp_json(res, {status: 'ok', data: records});
    }, function (e) {
        HttpUtil.resp_json(res, {status: 'error', data: 'error: ' + e.stack});
    });
}


var TaskList = {
    reply_to_task_list_page: reply_to_task_list_page,
    get_task_list: get_task_list
};


module.exports = TaskList;
