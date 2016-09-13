/**
 * Created by kangtian on 16/9/13.
 */

var AV = require('../lib/tab-login');
var StatusMap = require('../monkey/status-map');


AV.Cloud.define('sync_status_map', function(request, response) {
    StatusMap.sync_status_map()
});

StatusMap.sync_status_map();