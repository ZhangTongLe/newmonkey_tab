/**
 * Created by kangtian on 16/9/11.
 */

var HttpUtil = require('../lib/http-util');
var Stat = require('./stat-event');


function reply_to_product_detail_page(req, res, next) {
    var info = {};
    var status = 0;
    var errMsg = null;
    var product;
    if (req.query) {
        status = req.query.status || 0;
        errMsg = req.query.errMsg;
        info.product = req.query.product;
    }

    res.render('monkey/product-detail', {
        title: 'Product Detail',
        user: req.currentUser,
        info: info,
        status: status,
        errMsg: errMsg
    });
}


function reply_to_product_ver_detail_page(req, res, next) {
    var info = {};
    var status = 0;
    var errMsg = null;
    if (req.query) {
        status = req.query.status || 0;
        errMsg = req.query.errMsg;
        info.product = req.query.product;
        info.version = req.query.version;
    }

    res.render('monkey/version-detail', {
        title: 'Product Detail',
        user: req.currentUser,
        info: info,
        status: status,
        errMsg: errMsg
    });
}


function version_stat_all_in_one(req, res, next) {
    var product, version;
    if (req.body) {
        product = req.body.product;
        version = req.body.version;
    }
    var extra_para = {    // for function: stat_all_with_task_meta()
    };

    Stat.stat_product_ver_use_status_map(product, version, function (stat) {
        var resp = {
            status: 'ok',
            data: {
                acr_res: stat.acr,
                wcr_res: stat.wcr,
                ecr_res: stat.ecr
            }
        };
        HttpUtil.resp_json(res, resp);
    }, next, extra_para);
}


function version_stat_by_step(req, res, next) {
    var product, version;
    if (req.body) {
        product = req.body.product;
        version = req.body.version;
    }
    var extra_para = {    // for function: stat_all_with_status_map()
        stat_by_step: true,
        sample_num: 15
    };

    Stat.stat_product_ver_use_status_map(product, version, function (stat_list) {
        var resp = {
            status: 'ok',
            data: stat_list
        };
        HttpUtil.resp_json(res, resp);
    }, next, extra_para);
}


var ProductInfo = {
    reply_to_product_detail_page: reply_to_product_detail_page,
    version_stat_all_in_one: version_stat_all_in_one,
    version_stat_by_step: version_stat_by_step,
    reply_to_product_ver_detail_page: reply_to_product_ver_detail_page
};


module.exports = ProductInfo;
