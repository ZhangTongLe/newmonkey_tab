/**
 * Created by kangtian on 16/9/12.
 */

var express = require('express');
var router = express.Router();

var StatusMap = require('../monkey/status-map');
var EventHistory = require('../monkey/event-history');
var TaskList = require('../monkey/task-list');
var TaskDetail = require('../monkey/task-detail');
var TaskTimeLine = require('../monkey/task-timeline');
var ProductInfo = require('../monkey/product-info');
var NetGraph = require('../monkey/net-graph');


router.get('/', function (req, res, next) {
    res.redirect('/monkey/taskList');
});

router.get('/syncEventHistory/', function (req, res, next) {
    EventHistory.reply_to_sync_event_history(req, res, next);
});


// eventHistory part
router.get('/eventHistory/', function (req, res, next) {
    EventHistory.reply_to_event_history_page(req, res, next);
});
router.post('/eventHistoryFilter/', function (req, res, next) {
    EventHistory.event_history_do_filter(req, res, next);
});


// taskList part
router.get('/taskList/', function (req, res, next) {
    TaskList.reply_to_task_list_page(req, res, next);
});


// statusMap part
router.get('/statusMap/', function (req, res, next) {
    StatusMap.reply_to_status_map_page(req, res, next);
});
router.post('/statusMapFilter/', function (req, res, next) {
    StatusMap.status_map_do_filter(req, res, next);
});


// taskDetail part
router.get('/taskDetail/', function (req, res, next) {
    TaskDetail.reply_to_task_detail_page(req, res, next);
});


// taskStat part
router.post('/taskStatACR/', function (req, res, next) {
    TaskDetail.task_stat_arc(req, res, next);
});
router.post('/taskStatWCR/', function (req, res, next) {
    TaskDetail.task_stat_wrc(req, res, next);
});
router.post('/taskStatECR/', function (req, res, next) {
    TaskDetail.task_stat_erc(req, res, next);
});
router.post('/taskStatAllInOne/', function (req, res, next) {
    TaskDetail.task_stat_all_in_one(req, res, next);
});
router.post('/taskStatByStep/', function (req, res, next) {
    TaskDetail.task_stat_by_step(req, res, next);
});


// timeline part
router.get('/taskTimeline/', function (req, res, next) {
    TaskTimeLine.reply_to_task_timeline_page(req, res, next);
});


// versionDetail part
router.get('/ProductVerDetail/', function (req, res, next) {
    ProductInfo.reply_to_product_ver_detail_page(req, res, next);
});
router.post('/ProductVerStatAllInOne/', function (req, res, next) {
    ProductInfo.version_stat_all_in_one(req, res, next);
});


// *-network part
router.post('/NetGraphFilterEvent/', function (req, res, next) {
    NetGraph.event_history_do_filter(req, res, next);
});
router.post('/NetGraphAENodeEdge/', function (req, res, next) {
    NetGraph.activity_event_node_edge(req, res, next);
});
router.get('/NetGraphActivityFullScreen/', function (req, res, next) {
    NetGraph.net_graph_activity_full_screen(req, res, next);
});

module.exports = router;
