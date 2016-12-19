var express = require('express');
var router = express.Router();
var moment = require('moment')
var jwt = require('jwt-simple');

var AV = require('leanengine');
var HttpUtil = require('../lib/http-util');

var app = express();

app.set('jwtTokenSecret', 'YOUR_SECRET_STRING');

router.get('/', function (req, res, next) {
    res.redirect('/users/login');
});

router.get('/login', function (req, res, next) {
    var errMsg = req.query.errMsg;
    res.render('users/login', {title: '用户登录', errMsg: errMsg});
});

router.post('/login', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    console.log(username);
    console.log(password);
    var flag = 0;
    if (username == 'monkey' && password == '123456'){
        flag = 1;
    }
    if (flag == 1){
        // var jwt = require('jwt-simple');
        // var payload = {foo:'bar'};
        // var secret = 'abc';
        var token = jwt.encode('monkeylogin', 'yuan');
        // var decoded = jwt.decode(token1, secret);
        // console.log(decoded); //=> { foo: 'bar' }

        // token = '123456789';
        res.cookie('access_token', token, { maxAge: 900000, httpOnly: false});
        HttpUtil.resp_json(res, {status: 'ok'});
    }
    else{
        HttpUtil.resp_json(res, {status: 'error'});
    }
});

router.get('/register', function (req, res, next) {
    var errMsg = req.query.errMsg;
    res.render('users/register', {title: '用户注册', errMsg: errMsg});
});

router.post('/register', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    if (!username || username.trim().length == 0
        || !password || password.trim().length == 0) {
        return res.redirect('/users/register?errMsg=用户名或密码不能为空');
    }
    var user = new AV.User();
    user.set("username", username);
    user.set("password", password);
    user.signUp().then(function (user) {
        res.saveCurrentUser(user);
        res.redirect('/todos');
    }, function (err) {
        res.redirect('/users/register?errMsg=' + JSON.stringify(err));
    }).catch(next);
});

router.get('/logout', function (req, res, next) {
    req.currentUser.logOut();
    res.clearCurrentUser();
    return res.redirect('/users/login');
});

module.exports = router;
