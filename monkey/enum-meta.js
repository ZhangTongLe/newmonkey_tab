/**
 * Created by kangtian on 16/9/11.
 */

var AV = require('../lib/tab-login');
var G = require('../config/global');
var TabUtil = require('../lib/tab-util');


function sync_enum_meta(event_records) {
    if (event_records.length == 0)
        return;
    var EnumMeta = AV.Object.extend('EnumMeta');
    event_records.forEach(function (r, a, i) {
        /**
         * product, product_version, device
         * */
        var product_query = AV.Query(EnumMeta).equalTo('key_first', 'product').equalTo('value_str', r.get('product'));
        product_query.find().then(function (records) {
            if (records.length == 0){
                var product_meta = new EnumMeta();
                product_meta.set('key_first', 'product');
                product_meta.set('value_str', r.get('product'));
                TabUtil.save(product_meta);
            }
        }, function (error) {
            console.error(error)
        });

        var product_version_query = AV.Query(EnumMeta)
            .equalTo('key_first', 'product')
            .equalTo('key_second', 'version')
            .equalTo('value_str', r.get('version'));
        product_version_query.find().then(function (records) {
            if (records.length == 0){
                var product_version_meta = new EnumMeta();
                product_version_meta.set('key_first', 'product');
                product_version_meta.set('key_second', 'version');
                product_version_meta.set('value_str', r.get('version'));
                TabUtil.save(product_version_meta);
            }
        }, function (error) {
            console.error(error)
        });

        var device_query = AV.Query(EnumMeta).equalTo('key_first', 'device').equalTo('value_str', r.get('device'));
        device_query.find().then(function (records) {
            if (records.length == 0){
                var device_meta = new EnumMeta();
                device_meta.set('key_first', 'device');
                device_meta.set('value_str', r.get('device'));
                TabUtil.save(device_meta);
            }

        }, function (error) {
            console.error(error)
        });
    });
}


var EnumMeta = {
    sync_enum_meta: sync_enum_meta
};


module.exports = EnumMeta;
