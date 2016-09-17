/**
 * Created by kangtian on 16/9/13.
 */


function is_dev() {
    var os = require('os');
    var username = os.userInfo().username;
    var dev_user_list = ['kangtian'];
    return dev_user_list.indexOf(username) > -1;
}

var Global = {
    TAB_LIMIT: 1000,
    is_dev: is_dev,
    SPLITTER: '^_^'
};


module.exports = Global;
