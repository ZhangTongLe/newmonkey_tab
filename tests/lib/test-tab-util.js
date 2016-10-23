/**
 * Created by kangtian on 16/10/21.
 */


var AV = require('../../lib/tab-login');
var TabUtil = require('../../lib/tab-util');


function test_save_with_merge() {
    var EventHistory = AV.Object.extend('EventHistory');
    var eh = new EventHistory();
    eh.set('task_id', '2016-10-22_20.13.07.0730');
    eh.set('pre_activity', 'com.tencent.mobileqq.activity.FavEmosmManageActivity');
    eh.set('next_activity', 'com.tencent.mobileqq.activity.FavEmosmManageActivity');

    var records = [];
    for (var i = 0; i < 210; i ++) {
        records.push(eh);
    }

    TabUtil.save_records_with_merge(records, ['pre_activity', 'next_activity']).then().then(function (records) {
        console.log('records.length: ' + records.length);
    }, function (e) {
        console.log('in error');
        console.error(e);
    });
}


function test_unmerge_records() {
    var query = new AV.Query('EventHistory');
    query.equalTo('task_id', '2016-10-22_20.13.07.0730');
    TabUtil.find_all(query).then(function (records) {
        console.log('test_unmerge_records: length: ' + records.length);
        console.log(JSON.stringify(records, null, '  '));
    });
}


var TestTabUtil = {
    test_save_with_merge: test_save_with_merge,
    test_unmerge_records: test_unmerge_records
};


module.exports = TestTabUtil;

test_save_with_merge();