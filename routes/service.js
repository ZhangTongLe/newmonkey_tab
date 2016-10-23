/**
 * Created by kangtian on 16/9/12.
 */

var express = require('express');
var router = express.Router();

var Plot = require('../service/plot');
var TabBridge = require('../service/tab-bridge');

// plot part.
router.post('/plotGetGraphData', function (req, res, next) {
    Plot.get_graph_data(req, res, next);
});
router.post('/plotNetGraphUpload', function (req, res, next) {
    Plot.net_graph_upload(req, res, next);
});
router.get('/plotNetGraphShower', function (req, res, next) {
    Plot.net_graph_shower(req, res, next);
});


// tab-bridge part.
router.post('/SaveRecordsWithMerge', function (req, res, next) {
    TabBridge.save_records_with_merge(req, res, next);
});
router.post('/SaveRecordWithCache', function (req, res, next) {
    TabBridge.save_record_with_cache(req, res, next);
});


module.exports = router;
