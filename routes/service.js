/**
 * Created by kangtian on 16/9/12.
 */

var express = require('express');
var router = express.Router();

var Plot = require('../service/plot');

router.post('/plotGetGraphData', function (req, res, next) {
    Plot.get_graph_data(req, res, next);
});

router.post('/plotNetGraphUpload', function (req, res, next) {
    Plot.net_graph_upload(req, res, next);
});
router.get('/plotNetGraphShower', function (req, res, next) {
    Plot.net_graph_shower(req, res, next);
});


module.exports = router;
