/**
 * Created by kangtian on 16/9/11.
 */

var HttpUtil = require('../lib/http-util');
var Stat = require('./stat-event');


function reply_to_product_detail_page(req, res, next) {
    var status = 0;
    var errMsg = null;
    var product;
    if (req.query) {
        status = req.query.status || 0;
        errMsg = req.query.errMsg;
        product = req.query.product;
    }

    res.render('monkey/product-detail', {
        title: 'Product Detail',
        user: req.currentUser,
        product: product,
        status: status,
        errMsg: errMsg
    });
}


function reply_to_product_ver_detail_page(req, res, next) {
    var status = 0;
    var errMsg = null;
    var product, version;
    if (req.query) {
        status = req.query.status || 0;
        errMsg = req.query.errMsg;
        product = req.query.product;
        version = req.query.version;
    }

    res.render('monkey/version-detail', {
        title: 'Product Detail',
        user: req.currentUser,
        product: product,
        version: version,
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
    Stat.stat_product_ver_use_task_meta(product, version, function (stat) {
        var resp = {
            status: 'ok',
            data: {
                acr_res: stat.acr,
                wcr_res: stat.wcr,
                ecr_res: stat.ecr
            }
        };
        HttpUtil.resp_json(res, resp);
    }, next);
}


var ProductInfo = {
    reply_to_product_detail_page: reply_to_product_detail_page,
    version_stat_all_in_one: version_stat_all_in_one,
    reply_to_product_ver_detail_page: reply_to_product_ver_detail_page
};


module.exports = ProductInfo;
