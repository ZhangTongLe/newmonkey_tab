/**
 * Created by yuan on 2016/12/14.
 */

var jwt = require('jwt-simple');


function verify_token(req, res, next){
    var token = req.cookies['access_token'];
    if (token) {
        var decoded = jwt.decode(token, 'yuan');
        if (decoded == 'monkeylogin') {
            next();
        } else {
            res.redirect('/users/login');
        }
    } else {
        res.redirect('/users/login');
    }
}

var Verify = {
    verify_token: verify_token
};

module.exports = Verify;



// var token = new Cookies(req,res).get('access_token');
// jwt.verify(token,secretKey,function(err,token){
//     if(err){
//         // respond to request with error
//         console.log('aaa');
//         res.redirect('/users/login');
//     }else{
//         // continue with the request
//         next();
//     }
// });

