/**
 * Created by kangtian on 16/9/12.
 */

var G = require('../config/global');
var DELAY_MS = 3000;


var TabUtil = {
    delay_ms: DELAY_MS,
    set_avg_delay_ms: function (ms) {
        this.delay_ms = ms - 50;
    },
    get_random_delay_ms: function () {
        return Math.random() * this.delay_ms + 50;
    },
    save: function (record, callback, save_query, try_count) {
        if (try_count == undefined)
            try_count = 0;
        if (try_count > 5)
            console.error("save failed.\n" + JSON.stringify(record));

        var after_save;
        if (! save_query)
            after_save = record.save();
        else {
            after_save = record.save(null, {
                query: save_query
            });
        }

        return after_save.then(function (record) {
            if (callback)
                callback(record);
        }, function (error) {
            if (error.message.indexOf('A unique field was given a value that is already taken.') > -1)
                console.log(error.message);
            else if (error.message.indexOf('Too many requests.') > -1){
                var delay_ms = self.get_random_delay_ms();
                console.log('save, try again..., delay '+delay_ms);
                setTimeout(function () {
                    TabUtil.save(record, callback, save_query, try_count + 1);
                }, delay_ms);
            } else
                throw (error);
        })
    },
    find: function (query_obj, callback_ok, callback_fail, try_count) {
        if (try_count == undefined)
            try_count = 0;
        if (try_count > 5)
            callback_fail();

        query_obj.limit(G.TAB_LIMIT);    // 设置为最大的 limit.
        return query_obj.find().then(callback_ok, function (error) {
            if (error.message.indexOf('Too many requests.') > -1){
                var delay_ms = self.get_random_delay_ms();
                console.log('find, try again..., delay '+delay_ms);
                setTimeout(function () {
                    TabUtil.find(query_obj, callback_ok, callback_fail, try_count + 1);
                }, delay_ms);
            } else {
                if (callback_fail){
                    callback_fail(error);
                } else {
                    console.log(error);
                }
            }
        });
    },
    find_delay: function (query_obj, callback_ok, callback_fail, delay_ms, try_count) {
        delay_ms = delay_ms ? delay_ms : TabUtil.delay_ms;
        setTimeout(function () {
            TabUtil.find(query_obj, callback_ok, callback_fail, try_count);
        }, Math.random() * delay_ms + 50);
    }
};

module.exports = TabUtil;