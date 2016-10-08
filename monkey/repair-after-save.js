/**
 * Created by kangtian on 16/9/25.
 */


var AV = require('../lib/tab-login');
var EventHistory = require('./event-history');
var TabUtil = require('../lib/tab-util');


function repair_task(task_id) {
    var query = new AV.Query('EventHistory');
    query.equalTo('task_id', task_id);
    TabUtil.find_all(query, function (records) {
        console.log('in');
        for (var i = 0; i < records.length; i ++){
            console.log(i);
            console.log('get: ' + records[i].get('seq_no'));
            setTimeout(EventHistory.sync_one_event_record, 20 * i, records[i]);
        }
    });
}


repair_task('2016-09-25_08.38.43.0508');