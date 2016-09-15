/**
 * Created by kangtian on 16/9/11.
 */

var HttpUtil = require('../lib/http-util');

var Stat = require('./stat-event');


function reply_to_task_detail_page(req, res, next) {
    var status = 0;
    var errMsg = null;
    var task_id = -1;
    if (req.query) {
        status = req.query.status || 0;
        errMsg = req.query.errMsg;
        task_id = req.query['task_id'];
    }

    Stat.stat_acr(task_id, function (acr_res) {
        res.render('monkey/task-detail', {
            title: 'Task Detail',
            user: req.currentUser,
            task_id: task_id,
            acr_res: acr_res,
            status: status,
            errMsg: errMsg
        });
    });
}

function task_detail_do_update(req, res, next) {
    var task_id = null;
    if (req.body) {
        task_id = req.body['task_id'];
    }
    Stat.stat_acr(task_id, function (acr_res) {
        var resp = {
            status: 'ok',
            data: {
                acr_res: acr_res
            }
        };
        HttpUtil.resp_json(res, resp);
    });
}


var TaskDetail = {
    reply_to_task_detail_page: reply_to_task_detail_page,
    task_detail_do_update: task_detail_do_update,
};


module.exports = TaskDetail;
