var express = require('express');
var router = express.Router();
var AV = require('leanengine');

var History = AV.Object.extend('HistoryObject');

/**
 * 定义路由：获取所有 History UI 事件列表
 */
router.get('/', function (req, res, next) {
    var status = 0;
    var errMsg = null;
    if (req.query) {
        status = req.query.status || 0;
        errMsg = req.query.errMsg;
    }
    var query = new AV.Query('HistoryObject');
    query.equalTo('event', 'MonkeyUiEvent');
    query.limit(50);
    query.find({sessionToken: req.sessionToken}).then(function (results) {
        res.render('stat', {
            title: 'NewMonkey 执行路径统计',
            user: req.currentUser,
            records: results,
            status: status,
            errMsg: errMsg
        });
    }, function (err) {
        if (err.code === 101) {
            // 该错误的信息为：{ code: 101, message: 'Class or object doesn\'t exists.' }，说明 Todo 数据表还未创建，所以返回空的 Todo 列表。
            // 具体的错误代码详见：https://leancloud.cn/docs/error_code.html
            res.render('stat', {
                title: 'NewMonkey 执行路径统计',
                user: req.currentUser,
                records: [],
                status: status,
                errMsg: errMsg
            });
        } else {
            throw err;
        }
    }).catch(next);
});


module.exports = router;
