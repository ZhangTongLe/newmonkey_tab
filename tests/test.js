/**
 * Created by kangtian on 16/9/11.
 */

var AV = require('../lib/tab-login');
var TabUtil = require('../lib/tab-util');


var query = new AV.Query('EventHistory');
query.lessThan('createdAt', new Date());
TabUtil.find_all(query, function (records) {
    console.log(records.length);
}, function () {
    console.log('failed');
});

