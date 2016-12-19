/**
 * Created by kangtian on 16/9/12.
 */

var G = require('./config/global');
var express = require('express');
var logger = require('morgan');
var Verify = require('./verify');

var path = require('path');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var AV = require('leanengine');
var cookieParser = require('cookie-parser');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cookieParser());
// app.set('jwtTokenSecret','YUAN_SECRET_STRING');         //设置jwt机制的jwtTokenSecret变量，为后续的token验证做准备

app.use('/static', express.static('static'));           //指定静态文件目录

// debug, show access. after static to not show static.
console.log('IS_DEV: ' + G.is_dev());
if (G.is_dev()) {
    app.use(logger('dev'));
}

require('./cloud_func/aio');
app.use(AV.express());

// 加载 cookieSession 以支持 AV.User 的会话状态
app.use(AV.Cloud.CookieSession({secret: '05XgTktKPMkU', maxAge: 3600000, fetchUser: true}));

// 强制使用 https
app.enable('trust proxy');
app.use(AV.Cloud.HttpsRedirect());
app.use(methodOverride('_method'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: false}));

// Routes, 可以将一类的路由单独保存在一个文件中
var users = require('./routes/users');
var monkey = require('./routes/monkey');
var site = require('./routes/site');
var service = require('./routes/service');


app.use('/users', users);

app.use('*', function (req, res, next) {      // 参考express路由路径匹配
    Verify.verify_token(req, res, next);
});

app.use('/monkey', monkey);
app.use('/site', site);
app.use('/service', service);

app.get('/', function (req, res) {
    res.redirect('/monkey');               // 重定向到／monkey
});

// 下面的代码是错误处理模块，执行上面的中间键之后就不会跳到下面的代码中了
// 如果任何路由都没匹配到，则认为 404
// 生成一个异常让后面的 err handler 捕获
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// error handlers
// 如果是开发环境，则将异常堆栈输出到页面，方便开发调试
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('base/error', {
            message: err.message || err,
            error: err
        });
    });
}

// 如果是非开发环境，则页面只输出简单的错误信息
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('base/error', {
        message: err.message || err,
        error: {}
    });
});

module.exports = app;
