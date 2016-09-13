/**
 * Created by kangtian on 16/9/12.
 */

var express = require('express');
var router = express.Router();

var StatusMap = require('../monkey/status-map');
var EventHistory = require('../monkey/event-history');
var TaskDetail = require('../monkey/task_detail');

router.get('/', function (req, res, next) {
    res.redirect('/monkey/statusMap');
});

router.get('/syncEventHistory/', function (req, res, next) {
    EventHistory.reply_to_sync_event_history(req, res, next);
});


router.get('/eventHistory/', function (req, res, next) {
    EventHistory.reply_to_event_history_page(req, res, next);
});
router.post('/eventHistoryFilter/', function (req, res, next) {
    EventHistory.event_history_do_filter(req, res, next);
});


router.get('/statusMap/', function (req, res, next) {
    StatusMap.reply_to_status_map_page(req, res, next);
});
router.post('/statusMapFilter/', function (req, res, next) {
    StatusMap.status_map_do_filter(req, res, next);
});

router.get('/taskDetail/', function (req, res, next) {
    TaskDetail.reply_to_task_detail_page(req, res, next);
});
router.post('/taskDetailUpdate/', function (req, res, next) {
    TaskDetail.task_detail_do_update(req, res, next);
});

module.exports = router;
