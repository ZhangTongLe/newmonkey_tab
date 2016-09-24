/**
 * Created by kangtian on 16/9/12.
 */

var express = require('express');
var router = express.Router();


router.get('/building', function (req, res, next) {
    res.render('base/building', {});
});

module.exports = router;
