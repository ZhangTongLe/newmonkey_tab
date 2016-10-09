/**
 * Created by kangtian on 16/9/11.
 */

var AV = require('../lib/tab-login');
var HttpUtil = require('../lib/http-util');
var TabUtil = require('../lib/tab-util');
var Stat = require('./stat-event');


function reply_to_coverage_timeline_page(req, res, next) {
    var status = 0;
    var errMsg = null;
    var task_info = {};
    if (req.query) {
        status = req.query.status || 0;
        errMsg = req.query.errMsg;
        task_info.task_id = req.query.task_id;
        task_info.product = req.query.product;
        task_info.version = req.query.version;
    }

    task_info.duration = -1;
    if (task_info.task_id) {
        var TaskMeta = AV.Object.extend('TaskMeta');
        var task_meta_query = new AV.Query('TaskMeta')
            .equalTo('task_id', task_info.task_id);
        TabUtil.find(task_meta_query, function (records) {
            if (records.length > 0){
                if (records[0].get('last_time') && records[0].get('start_time'))
                    task_info.duration = (records[0].get('last_time') - records[0].get('start_time')) / 1000;
            }
            do_render();
        }, next);
    } else {
        do_render();
    }

    function do_render() {
        res.render('monkey/coverage-timeline', {
            title: 'Coverage TimeLine',
            user: req.currentUser,
            task_info: task_info,
            status: status,
            errMsg: errMsg
        });
    }
}


var coverageTimeline = {
    reply_to_coverage_timeline_page: reply_to_coverage_timeline_page
};


module.exports = coverageTimeline;
