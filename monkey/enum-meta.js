/**
 * Created by kangtian on 16/9/11.
 */

var AV = require('../lib/tab-login');
var G = require('../config/global');
var TabUtil = require('../lib/tab-util');


function sync_enum_meta(event_records) {
    console.log(1);
    if (event_records.length == 0)
        return;
    console.log(2);
    chain_call(sync_one_event_record, event_records);
}

function sync_one_event_record(r, callback, i) {
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
        .equalTo('key_first', 'product')
        .equalTo('key_second', 'version')
        .equalTo('value_str', r.get('version'));

    TabUtil.find_delay(product_version_query, function (records) {
        if (records.length == 0){
            var product_version_meta = new EnumMeta();
            product_version_meta.set('key_first', 'product');
            product_version_meta.set('key_second', 'version');
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

    if (callback)
        callback(i);
}

function chain_call(func, args_list) {
    // func must have a callback.
    // func(args, callback, i);
    var stack_list = [];
    var stack = {
        args: undefined,
        func: undefined,
        callback: undefined
    };
    for (var i = 0; i < args_list.length; i ++){
        var new_stack = JSON.parse(JSON.stringify(stack));
        new_stack.args = args_list[i];
        new_stack.callback = function (i) {
            i += 1;
            if (i >= stack_list.length)
                return;
            var this_stack = stack_list[i];
            this_stack.func(this_stack.args, this_stack.callback, i);
        };
        new_stack.func = func;
        stack_list.push(new_stack);
    }
    stack = stack_list[0];
    stack.func(stack.args, stack.callback, 0);
}


var EnumMeta = {
    sync_enum_meta: sync_enum_meta
};


module.exports = EnumMeta;

chain_call(function (x, callback, i) {
    console.log(x);
    if (callback)
        callback(i);
}, [1, 2, 3, 4, 5]);
