/**
 * Created by kangtian on 16/9/11.
 */

var AV = require('../lib/tab-login');
var G = require('../config/global');
var HttpUtil = require('../lib/http-util');
var TabUtil = require('../lib/tab-util');

var EnumMeta = require('./enum-meta');


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

            // query device
            var device_query = new AV.Query('EnumMeta').equalTo('key_first', 'device');
            TabUtil.find(device_query, function (records) {
                records.forEach(function (r) {
                    device_list.push(r.get('value_str'));
                });

                // finish query ...
                when_meta_info_ok();
            });
        });
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
    reply_to_task_list_page: reply_to_task_list_page,
};


module.exports = TaskList;
