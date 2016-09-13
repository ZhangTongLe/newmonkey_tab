/**
 * Created by kangtian on 16/9/12.
 */

var express = require('express');
var router = express.Router();

var sm = require('../monkey/status-map');

router.get('/', function (req, res, next) {
    res.redirect('/stat/statusMap');
});

router.get('/statusMap/', function (req, res, next) {
    sm.reply_to_status_map_page(req, res, next);
});


router.post('/statusMapFilter/', function (req, res, next) {
    sm.status_map_do_filter(req, res, next);
});

module.exports = router;
