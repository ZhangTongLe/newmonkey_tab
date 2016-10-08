/**
 * Created by kangtian on 16/9/13.
 */

var AV = require('../lib/tab-login');
var EventHistory = require('../monkey/event-history');


AV.Cloud.define('sync_event_history', function(request, response) {
    EventHistory.sync_event_history()
});


AV.Cloud.afterSave('EventHistory', function(request) {
    EventHistory.sync_one_event_record(request.object);
});