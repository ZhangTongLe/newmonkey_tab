/**
 * Created by kangtian on 16/9/13.
 *
 * Note :
 *
 *   when use os.userInfo(), TAB has a error:
         [ERROR] /home/leanengine/app/config/global.js:13
         [ERROR]         username = os.userInfo().username;
         [ERROR]                       ^
         [ERROR] TypeError: undefined is not a function
         [ERROR]     at Object.is_dev (/home/leanengine/app/config/global.js:13:23)
         [ERROR]     at Object.<anonymous> (/home/leanengine/app/app.js:27:28)
         [ERROR]     at Module._compile (module.js:460:26)
         [ERROR]     at Object.Module._extensions..js (module.js:478:10)
         [ERROR]     at Module.load (module.js:355:32)
         [ERROR]     at Function.Module._load (module.js:310:12)
         [ERROR]     at Module.require (module.js:365:17)
         [ERROR]     at require (module.js:384:17)
         [ERROR]     at Object.<anonymous> (/home/leanengine/app/server.js:9:11)
         [ERROR]     at Module._compile (module.js:460:26)
 */

var os = require('os');


function is_dev() {
    var username;
    if (os.userInfo == undefined)    // TAB can't load os model.
        username = '';
    else
        username = os.userInfo().username;
    var dev_user_list = ['kangtian'];
    return dev_user_list.indexOf(username) > -1;
}

var Global = {
    HOST: 'http://localhost:3000',
    TAB_LIMIT: 1000,
    is_dev: is_dev,
    SPLITTER: '^_^'
};


module.exports = Global;
