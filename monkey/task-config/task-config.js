/**
 * Created by kangtian on 16/10/15.
 */


var AV = require('../../lib/tab-login');
var TabUtil = require('../../lib/tab-util');
var HttpUtil = require('../../lib/http-util');
var moment = require('moment');

function reply_to_add_config_page(req, res, next) {
    var status = 0, errMsg = null;

    if (req.query) {
        status = req.query.status || 0;
        errMsg = req.query.errMsg;
    }

    var query = new AV.Query('ProductInfo');
    query.descending('updatedAt');
    TabUtil.find(query, function (records) {
        var product_list = [];
        records.forEach(function (r) {
            product_list.push(r.get('product_name'));
        });
        res.render('monkey/task-config/add-config', {
            title: 'Add Config',
            user: req.currentUser,
            product_list: product_list,
            status: status,
            errMsg: errMsg
        });
    }, next);
}


function reply_to_modify_config_page(req, res, next) {
    var status = 0, errMsg = null;
    var task_name = null;

    if (req.query) {
        status = req.query.status || 0;
        errMsg = req.query.errMsg;
        task_name = req.query.task_name;
    }

    if (! task_name) {
        HttpUtil.resp_json(res, {status: 'error', data: 'not found parameter: task_name'});
    }

    var query = new AV.Query('TaskConfig');
    query.include('product');
    query.include('product.product_name');
    query.equalTo('task_name', task_name);
    TabUtil.find(query, function (records) {
        if (records.length > 0) {
            var config = records[0];
            config.set('product_name', config.get('product').get('product_name'));
            res.render('monkey/task-config/modify-config', {
                title: 'Modify Config',
                user: req.currentUser,
                config: config,
                status: status,
                errMsg: errMsg
            });
        } else {
            HttpUtil.resp_json(res, {status: 'error', data: 'not found task: ' + task_name});
        }

    }, next);
}


function get_task_configs(req, res, next) {
    var product, task_name, only_task_name;

    var para = HttpUtil.get_request_body(req);

    if (para) {
        product = para.product;
        task_name = para.task_name;
        only_task_name = (para.only_task_name == true || para.only_task_name == 'true');
    }

    var query = new AV.Query('TaskConfig');
    query.include('product');
    query.include('product.product_name');

    if (product) {
        var inner_query = new AV.Query('ProductInfo');
        inner_query.equalTo('product_name', product);
        query.matchesQuery('product', inner_query)
    }
    if (task_name) {
        query.equalTo('task_name', task_name);
    }
    if (only_task_name == true || only_task_name == 'true') {
        query.select('task_name', 'product');
    }
    query.descending('updatedAt');

    TabUtil.find(query, function (records) {
        records.forEach(function (r) {
            r.set('product_name', r.get('product').get('product_name'));
        });
        var resp = {
            status: 'ok',
            data: records
        };
        HttpUtil.resp_json(res, resp);
    }, next);
}


function submit_task_config(req, res, next) {
    try {
        if (! req.body || ! req.body.formJsonStr) {
            HttpUtil.resp_json(res, {
                status: 'error',
                data: 'not get parameter: formJsonStr'
            });
        }

        function fill_record(record, config) {
            record.set('task_name', config['taskName']);
            record.set('config', config);

            var product_query = new AV.Query('ProductInfo');
            product_query.equalTo("product_name", config['product']);

            TabUtil.find(product_query, function (records) {
                if (records.length > 0) {
                    record.set('product', records[0]);
                    TabUtil.save(record, function () {
                        HttpUtil.resp_json(res, {status: 'ok', data: 'success: add task config.'});
                    }, function (e) {
                        HttpUtil.resp_json(res, {status: 'error', data: 'error: ' + e.stack});
                    });
                } else {
                    HttpUtil.resp_json(res, {status: 'error', data: 'not found product: ' + config['product']});
                }
            }, next);
        }

        var config = JSON.parse(req.body.formJsonStr);
        var task_name = config['taskName'];
        var query = new AV.Query('TaskConfig');
        query.equalTo('task_name', task_name);
        TabUtil.find(query, function (records) {
            if (records.length > 0) {
                fill_record(records[0], config);
            } else {
                var TaskConfig = new AV.Object.extend('TaskConfig');
                var record = new TaskConfig();
                fill_record(record, config);
            }
        }, next);
    } catch (e) {
        console.error(e);
    }
}


function replay_to_task_config_list_page(req, res, next) {
    var status = 0, errMsg = null;

    if (req.query) {
        status = req.query.status || 0;
        errMsg = req.query.errMsg;
    }

    res.render('monkey/task-config/config-list', {
        title: 'Task Config List',
        user: req.currentUser,
        status: status,
        errMsg: errMsg
    });
}


function delete_task_configs(req, res, next) {
    var task_name;
    if (req.query) {
        task_name = req.query.task_name;
    }
    if (! task_name) {
        HttpUtil.resp_json(res, {status: 'error', data: 'not found parameter: task_name'});
    }

    var query = new AV.Query('TaskConfig');
    query.equalTo('task_name', task_name);
    TabUtil.find(query, function (records) {
        if (records.length <= 0) {
            HttpUtil.resp_json(res, {status: 'error', data: 'not found task: ' + task_name});
        }
        records[0].destroy(function () {
            HttpUtil.resp_json(res, {status: 'ok', data: 'delete success: ' + task_name});
        }, function () {
            HttpUtil.resp_json(res, {status: 'error', data: 'delete failed: ' + task_name});
        });
    }, next);
}

function get_task_config_with_identify(req, res, next) {
    /**
     *  返回值为了兼容老接口, 返回数据结构为:
     *  {
     *      result: 'ok' | 'wrong',
     *      datas: {
     *          identify: '...',
     *          taskConfigs: {
     *              product_name: {
     *                  task_name1: {
     *                      field1: 'value1',
     *                      field2: 'value2',
     *                      ...
     *                  },
     *                  task_name2: 'notChange',
     *                  task_name3: 'delete'
     *                  ...
     *              }
     *          }
     *      }
     *  }
     */
    var identify_str, identify;
    if (req.body) {
        identify_str = req.body.identify;
    }
    if (! identify_str) {
        identify_str = req.query.identify;
    }

    var query = new AV.Query('TaskConfig');
    query.include('product');
    query.include('product.product_name');

    TabUtil.find(query, function (records) {
        records.forEach(function (r) {
            r.set('product_name', r.get('product').get('product_name'));
        });

        if ([null, undefined, '', 'null', 'None', 'init'].indexOf(identify_str) > -1) {
            identify = null;
        } else {
            try {
                identify = JSON.parse(identify_str);
            } catch (e) {
                HttpUtil.resp_json(res, {result: 'wrong', datas: 'error: ' + e.stack});
            }
        }
        var ret_obj = get_needed_config_with_identify(records, identify);
        HttpUtil.resp_json(res, {result: 'ok', datas: {
            taskConfigs: ret_obj.delta_config,
            identify: JSON.stringify(ret_obj.identify)
        }});
    }, function (e) {
        HttpUtil.resp_json(res, {result: 'wrong', datas: 'error: ' + e.stack});
    });
}


function gen_identify_of_product_configs(product_configs) {
    var identify = {};
    for (var product_name in product_configs) {
        if (! product_configs.hasOwnProperty(product_name))    continue;

        identify[product_name] = {};
        var product_task_configs = product_configs[product_name];
        for (var task_name in product_task_configs) {
            if (! product_task_configs.hasOwnProperty(task_name))    continue;

            identify[product_name][task_name] = {updateTime: product_task_configs[task_name]['updateTime']}
        }
    }

    return identify;
}

function get_needed_config_with_identify(config_records, identify) {
    var product_configs = {};
    var delta_config = {};

    try {
        config_records.forEach(function (r) {
            var product_name = r.get('product_name');
            var task_name = r.get('task_name');
            var config = r.get('config');
            if (product_configs[product_name] == undefined) {
                product_configs[product_name] = {};
            }
            product_configs[product_name][task_name] = config;
            product_configs[product_name][task_name].updateTime = moment(r.updatedAt).format('YYYY-MM-DD hh:mm:ss');
        });

        if (! identify) {
            delta_config = product_configs;
        } else {
            for (var product_name in product_configs) {
                if (! product_configs.hasOwnProperty(product_name))    continue;

                delta_config[product_name] = {};
                if (! identify[product_name]) {
                    identify[product_name] = {};
                }

                var product_task_configs = product_configs[product_name];
                for (var task_name in product_task_configs) {
                    if (! product_task_configs.hasOwnProperty(task_name))    continue;

                    if (! identify[product_name][task_name]) {
                        delta_config[product_name][task_name] = product_task_configs[task_name];
                    } else {
                        var identify_time = identify[product_name][task_name]['updateTime'];
                        var server_time = product_task_configs[task_name].updatedAt;
                        if (server_time > identify_time) {
                            delta_config[product_name][task_name] = product_task_configs[task_name];
                        } else {
                            delta_config[product_name][task_name] = 'notChange';
                        }
                    }
                }

                for (task_name in identify[product_name]) {
                    if (! identify[product_name].hasOwnProperty(task_name))    continue;
                    if (! product_task_configs[task_name]) {
                        delta_config[product_name][task_name] = 'delete';
                    }
                }
            }
        }

        return {
            delta_config: delta_config,
            identify: gen_identify_of_product_configs(product_configs)
        }
    } catch (e) {
        console.error(e);
    }

}


var TaskConfig = {
    reply_to_add_config_page: reply_to_add_config_page,
    reply_to_modify_config_page: reply_to_modify_config_page,
    get_task_configs: get_task_configs,
    submit_task_config: submit_task_config,
    replay_to_task_config_list_page: replay_to_task_config_list_page,
    delete_task_configs: delete_task_configs,
    get_task_config_with_identify: get_task_config_with_identify
};


module.exports = TaskConfig;
