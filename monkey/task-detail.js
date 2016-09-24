/**
 * Created by kangtian on 16/9/11.
 */

var AV = require('../lib/tab-login');
var HttpUtil = require('../lib/http-util');
var TabUtil = require('../lib/tab-util');
var Stat = require('./stat-event');


function reply_to_task_detail_page(req, res, next) {
    var status = 0;
    var errMsg = null;
    var task_info = {};
    if (req.query) {
        status = req.query.status || 0;
        errMsg = req.query.errMsg;
        task_info.task_id = req.query.task_id;
    }

    task_info.duration = 'Sorry, I can not tell you the task duration.';
    if (task_info.task_id) {
        var TaskMeta = AV.Object.extend('TaskMeta');
        var task_meta_query = new AV.Query('TaskMeta')
            .equalTo('task_id', task_info.task_id);
        TabUtil.find(task_meta_query, function (records) {
            if (records.length > 0){
                if (records[0].get('last_time') && records[0].get('start_time'))
                    task_info.duration = records[0].get('last_time') - records[0].get('start_time');
            }
            do_render();
        });
    } else {
        do_render();
    }

    function do_render() {
        res.render('monkey/task-detail', {
            title: 'Task Detail',
            user: req.currentUser,
            task_info: task_info,
            status: status,
            errMsg: errMsg
        });
    }

}


function task_stat_arc(req, res, next) {
    var task_id = null;
    if (req.body) {
        task_id = req.body['task_id'];
    }
    Stat.stat_acr(task_id, function (acr_res) {
        var resp = {
            status: 'ok',
            data: {acr_res: acr_res}
        };
        HttpUtil.resp_json(res, resp);
    }, next);
}

function task_stat_wrc(req, res, next) {
    var task_id = null;
    if (req.body) {
        task_id = req.body['task_id'];
    }
    Stat.stat_wcr(task_id, function (wcr_res) {
        var resp = {
            status: 'ok',
            data: {wcr_res: wcr_res}
        };
        HttpUtil.resp_json(res, resp);
    }, next);
}

function task_stat_erc(req, res, next) {
    var task_id = null;
    if (req.body) {
        task_id = req.body['task_id'];
    }
    Stat.stat_ecr(task_id, function (ecr_res) {
        var resp = {
            status: 'ok',
            data: {ecr_res: ecr_res}
        };
        HttpUtil.resp_json(res, resp);
    }, next);
}

function task_stat_all_in_one(req, res, next) {
    var task_id = null;
    if (req.body) {
        task_id = req.body['task_id'];
    }
    Stat.stat_task_use_task_meta(task_id, function (stat) {
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


var TaskDetail = {
    reply_to_task_detail_page: reply_to_task_detail_page,
    task_stat_arc: task_stat_arc,
    task_stat_wrc: task_stat_wrc,
    task_stat_erc: task_stat_erc,
    task_stat_all_in_one: task_stat_all_in_one
};


module.exports = TaskDetail;
