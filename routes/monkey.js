/**
 * Created by kangtian on 16/9/12.
 */

var express = require('express');
var router = express.Router();

var StatusMap = require('../monkey/status-map');
var EventHistory = require('../monkey/event-history');

router.get('/', function (req, res, next) {
    res.redirect('/stat/statusMap');
});

router.get('/syncEventHistory/', function (req, res, next) {
    EventHistory.reply_to_sync_event_history(req, res, next);
});

router.get('/statusMap/', function (req, res, next) {
    StatusMap.reply_to_status_map_page(req, res, next);
});


router.post('/statusMapFilter/', function (req, res, next) {
    StatusMap.status_map_do_filter(req, res, next);
});

module.exports = router;
