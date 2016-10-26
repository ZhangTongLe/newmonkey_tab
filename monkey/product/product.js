/**
 * Created by kangtian on 16/10/15.
 */


var AV = require('../../lib/tab-login');
var TabUtil = require('../../lib/tab-util');
var HttpUtil = require('../../lib/http-util');

function reply_to_product_list_page(req, res, next) {
    var status = 0, errMsg = null;

    if (req.query) {
        status = req.query.status || 0;
        errMsg = req.query.errMsg;
    }

    res.render('monkey/product/product-list', {
        title: 'Product List',
        user: req.currentUser,
        status: status,
        errMsg: errMsg
    });
}


function get_product_list(req, res, next) {
    var product_name, only_product_name;

    var para = HttpUtil.get_request_body(req);
    if (para) {
        product_name = para.product_name;
        only_product_name = (para.only_product_name == true || para.only_product_name == 'true');
    }

    var query = new AV.Query('ProductInfo');
    if (product_name) {
        query.equalTo('product_name', product_name)
    }
    if (only_product_name == true || only_product_name == 'true') {
        query.select('product_name');
    }
    query.descending('updatedAt');
    TabUtil.find(query, function (records) {
        if (only_product_name) {
            for (var i = 0; i < records.length; i ++) {
                records[i] = records[i].get('product_name');
            }
        }
        HttpUtil.resp_json(res, {status: 'ok', data: records});
    }, function (e) {
        HttpUtil.resp_json(res, {status: 'error', data: 'error: ' + e.stack});
    });
}

function reply_to_add_product_page(req, res, next) {
    var status = 0, errMsg = null;

    if (req.query) {
        status = req.query.status || 0;
        errMsg = req.query.errMsg;
    }

    res.render('monkey/product/add-product', {
        title: 'Add Product',
        user: req.currentUser,
        status: status,
        errMsg: errMsg
    });
}


function get_sng_product_list(req, res, next) {
    var only_product_name;

    var para = HttpUtil.get_request_body(req);
    if (para) {
        only_product_name = (para.only_product_name == true || para.only_product_name == 'true');
    }

    var query = new AV.Query('KeyValue');
    query.equalTo('key', 'sng_product_list');
    TabUtil.find(query, function (records) {
        if (records.length <= 0) {
            HttpUtil.resp_json(res, {status: 'error', data: 'error: not found key: sng_product_list.'});
        }
        var product_list = records[0].get('value_array');
        if (only_product_name) {
            for (var i = 0; i < product_list.length; i ++) {
                product_list[i] = product_list[i]['product_name'];
            }
        }
        HttpUtil.resp_json(res, {status: 'ok', data: product_list});
    }, function (e) {
        HttpUtil.resp_json(res, {status: 'error', data: 'error: ' + e.stack});
    });
}


function submit_add_product(req, res, next) {
    var product_values;

    try {
        if (req.body) {
            product_values = req.body.product_values;
        }
        if (! product_values) {
            HttpUtil.resp_json(res, {status: 'error', data: 'not found parameter: product_values'});
        } else {
            product_values = JSON.parse(product_values);
        }

        var query = new AV.Query('ProductInfo');
        query.equalTo('product_name', product_values.product_name);
        TabUtil.find(query, function (records) {
            try {
                if (records.length <= 0) {
                    var ProductInfo = AV.Object.extend('ProductInfo');
                    var new_product = new ProductInfo();
                    for (var key in product_values) {
                        if (product_values.hasOwnProperty(key)) {
                            new_product.set(key, product_values[key]);
                        }
                    }
                    TabUtil.save(new_product, function () {
                        HttpUtil.resp_json(res, {status: 'ok', data: 'add product success: ' + product_values.product_name});
                    }, function (e) {
                        HttpUtil.resp_json(res, {status: 'error', data: 'error: ' + e.stack});
                    })
                }
            } catch (e) {
                HttpUtil.resp_json(res, {status: 'error', data: 'error: ' + e.stack});
            }

        }, function (e) {
            HttpUtil.resp_json(res, {status: 'error', data: 'error: ' + e.stack});
        })
    } catch (e) {
        HttpUtil.resp_json(res, {status: 'error', data: 'error: ' + e.stack});
    }
}


function reply_to_modify_product_page(req, res, next) {
    var status = 0, errMsg = null;
    var product_name = null;

    if (req.query) {
        status = req.query.status || 0;
        errMsg = req.query.errMsg;
        product_name = req.query.product_name;
    }

    if (! product_name) {
        HttpUtil.resp_json(res, {status: 'error', data: 'not found parameter: product_name'});
    }

    var query = new AV.Query('ProductInfo');
    query.equalTo('product_name', product_name);
    TabUtil.find(query, function (records) {
        if (records.length > 0) {
            var product = records[0];
            res.render('monkey/product/add-product', {
                title: 'Modify Product',
                user: req.currentUser,
                product: product,
                status: status,
                errMsg: errMsg
            });
        } else {
            HttpUtil.resp_json(res, {status: 'error', data: 'not found task: ' + product_name});
        }
    }, next);
}


function delete_product(req, res, next) {
    var product_name = null;

    if (req.query) {
        product_name = req.query.product_name;
    }

    if (! product_name) {
        HttpUtil.resp_json(res, {status: 'error', data: 'not found parameter: product_name'});
    }
    var query = new AV.Query('ProductInfo');
    query.equalTo('product_name', product_name);
    TabUtil.find(query, function (records) {
        if (records.length > 0) {
            var product = records[0];
            product.destroy().then(function () {
                HttpUtil.resp_json(res, {status: 'ok', data: 'delete product success: ' + product_name});
            }, function (e) {
                HttpUtil.resp_json(res, {status: 'error', data: 'error: ' + e.stack});
            });
        } else {
            HttpUtil.resp_json(res, {status: 'error', data: 'not found product: ' + product_name});
        }
    }, next);
}


var Product = {
    reply_to_product_list_page: reply_to_product_list_page,
    get_product_list: get_product_list,
    reply_to_add_product_page: reply_to_add_product_page,
    get_sng_product_list: get_sng_product_list,
    submit_add_product: submit_add_product,
    reply_to_modify_product_page: reply_to_modify_product_page,
    delete_product: delete_product
};


module.exports = Product;
