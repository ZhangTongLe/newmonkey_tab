/**
 * Created by kangtian on 16/9/11.
 */

var AV = require('../lib/tab-login');
var TabUtil = require('../lib/tab-util');


function get_query_event_pre(task_id, seq_no, callback) {
    var query_pre = new AV.Query('EventHistory')
        .equalTo('task_id', task_id)
        .lessThan('seq_no', seq_no)
        .descending('seq_no');
    query_pre.limit(1);
    TabUtil.find(query_pre, function (records) {
        if (records.length > 0){
            callback(records[0]);
        } else {
            callback(null);
        }
    }, callback(null));
}


var MonkeyUtil = {
    get_query_event_pre: get_query_event_pre
};


module.exports = MonkeyUtil;

