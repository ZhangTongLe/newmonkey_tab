/**
 * Created by kangtian on 16/9/11.
 */

var AV = require('../lib/tab-login');
var G = require('../config/global');
var TabUtil = require('../lib/tab-util');


function sync_enum_meta(event_records) {
    if (event_records.length == 0)
        return;
    for (var i = 0; i < event_records.length; i ++){
        var r = event_records[i];
        setTimeout(function (r) {
            sync_one_event_record(r);
        }, i * 10, r);
    }
}

function sync_one_event_record(r) {
    /**
     * product, product_version, device
     * */
    var EnumMeta = AV.Object.extend('EnumMeta');
    var product_query = new AV.Query('EnumMeta')
        .equalTo('key_first', 'product')
        .equalTo('key_second', null)
        .equalTo('value_str', r.get('product'));
    TabUtil.find_delay(product_query, function (records) {
        if (records.length == 0){
            console.log(4);
            var product_meta = new EnumMeta();
            product_meta.set('key_first', 'product');
            product_meta.set('value_str', r.get('product'));
            product_meta.set('stage', 'EventHistory');
            TabUtil.save(product_meta);
        }
    }, function (error) {
        console.error(error)
    });

    var product_version_query = new AV.Query('EnumMeta')
        .equalTo('key_first', 'product_version')
        .equalTo('key_second', r.get('product'))
        .equalTo('value_str', r.get('version'));

    TabUtil.find_delay(product_version_query, function (records) {
        if (records.length == 0){
            var product_version_meta = new EnumMeta();
            product_version_meta.set('key_first', 'product_version');
            product_version_meta.set('key_second', r.get('product'));
            product_version_meta.set('value_str', r.get('version'));
            product_version_meta.set('stage', 'EventHistory');
            TabUtil.save(product_version_meta);
        }
    }, function (error) {
        console.error(error)
    });

    var device_query = new AV.Query('EnumMeta')
        .equalTo('key_first', 'device')
        .equalTo('value_str', r.get('device'));
    TabUtil.find_delay(device_query, function (records) {
        if (records.length == 0){
            var device_meta = new EnumMeta();
            device_meta.set('key_first', 'device');
            device_meta.set('value_str', r.get('device'));
            device_meta.set('stage', 'EventHistory');
            TabUtil.save(device_meta);
        }
    }, function (error) {
        console.error(error)
    });
}

var EnumMeta = {
    sync_enum_meta: sync_enum_meta,
    sync_one_event_record: sync_one_event_record
};


module.exports = EnumMeta;
