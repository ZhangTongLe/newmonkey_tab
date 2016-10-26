/**
 * Created by kangtian on 16/9/11.
 */

var AV = require('../../lib/tab-login');
var TabUtil = require('../../lib/tab-util');
var EventHistory = require('../../monkey/event-history');


var query = new AV.Query('EventHistory');
query.exists('merged');
query.limit(1);
query.find(function (records) {
    console.log(records.length);
    if (records.length > 0) {
        var record = records[0];
        EventHistory.sync_one_event_record(record);
    }
}, function () {
    console.log('failed');
});

