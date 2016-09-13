/**
 * Created by kangtian on 16/9/13.
 */

var AV = require('../lib/tab-login');
var StatusMap = require('../monkey/event-history');


AV.Cloud.define('sync_event_history', function(request, response) {
    StatusMap.sync_event_history()
});
