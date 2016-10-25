/**
 * Created by kangtian on 16/10/21.
 */

'use strict';

var AV = require('../../lib/tab-login');
var TabUtil = require('../../lib/tab-util');
var TabBridge = require('../../service/tab-bridge');
var request = require('request');


// var host = 'https://hi-monkey.leanapp.cn';
var host = 'http://127.0.0.1:3000';


function test_save_record_with_cache() {
    var StatusMap = AV.Object.extend('StatusMap');
    var eh = new StatusMap();
    eh.set('event_identify', '2016-10-22_20.13.07.0730');
    eh.set('product', 'com.tencent.mobileqq');
    eh.set('version', '5.5.8');
    eh.set('is_activity_changed', true);

    for (let i = 0; i < 7; i ++) {
        setTimeout(function () {
            var record_json = {class_name: 'StatusMap', record: {}};

            if (i > 3) {
                eh.set('is_activity_changed', false);
            }
            for (var key in eh.attributes) {
                if (eh.attributes.hasOwnProperty(key))
                    record_json['record'][key] = eh.attributes[key];
            }

            console.log(JSON.stringify(record_json, null, ''));
            record_json['record'] = JSON.stringify(record_json['record']);
            request.post(host + '/service/SaveRecordWithCache', {form: record_json},
                function(error, response, body){
                    if (!error && response.statusCode == 200) {
                        console.log(body);
                    }
                }
            );
        }, 100 * i);

    }
}

function test_save_records_with_cache() {
    var StatusMap = AV.Object.extend('StatusMap');
    var sm = new StatusMap();
    sm.set('event_identify', '2016-10-22_20.13.07.0730');
    sm.set('product', 'com.tencent.mobileqq');
    sm.set('version', '5.5.8');
    sm.set('is_activity_changed', true);

    var record_list = [];

    var records_json = {class_name: 'StatusMap', record_list: []};
    for (let i = 0; i < 7; i ++) {
        records_json.record_list.push(sm);
    }
    records_json['record_list'] = JSON.stringify(records_json['record_list']);
    request.post(host + '/service/SaveRecordWithCache', {form: records_json},
        function(error, response, body){
            if (!error && response.statusCode == 200) {
                console.log(body);
            }
        }
    );
}


var TestTabBridge = {
    test_save_record_with_cache: test_save_record_with_cache,
    test_save_records_with_cache: test_save_records_with_cache
};


module.exports = TestTabBridge;

test_save_records_with_cache();