/**
 * Created by kangtian on 16/9/11.
 */

var AV = require('../lib/tab-login');
var G = require('../config/global');
var TabUtil = require('../lib/tab-util');

var EnumMeta = require('./enum-meta');
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
        var query = new AV.Query('EventHistory');
        query.limit(G.TAB_LIMIT);
        TabUtil.find(query, function (results) {
            res.render('monkey/task-list', {
                title: 'Task List',
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

var TaskList = {
    reply_to_task_list_page: reply_to_task_list_page
};


module.exports = TaskList;
