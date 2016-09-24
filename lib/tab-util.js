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
                console.error(error.message);
            else if (error.message.indexOf('Too many requests.') > -1){
                var delay_ms = self.get_random_delay_ms();
                console.error('save, try again..., delay '+delay_ms);
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

        if (! query_obj._limit || query_obj._limit <= 0)
            query_obj.limit(G.TAB_LIMIT);    // 设置为最大的 limit.
        return query_obj.find().then(callback_ok, function (error) {
            if (error.message.indexOf('Too many requests.') > -1){
                var delay_ms = self.get_random_delay_ms();
                console.error('find, try again..., delay '+delay_ms);
                setTimeout(function () {
                    TabUtil.find(query_obj, callback_ok, callback_fail, try_count + 1);
                }, delay_ms);
            } else {
                if (callback_fail){
                    callback_fail(error);
                } else {
                    console.error(error);
                }
            }
        });
    },
    find_all: function (query_obj, callback_ok, callback_fail) {
        var query_before = function(query_obj, date, record_list, callback_ok, callback_fail){
            query_obj.lessThanOrEqualTo('createdAt', date);
            query_obj.descending('createdAt');
            TabUtil.find(query_obj, function (records) {
                try{
                    record_list = Array.prototype.concat(record_list, records);
                } catch (e) {
                    console.error(e);
                }

                if (records.length >= G.TAB_LIMIT){
                    var new_date = records[records.length - 1].createdAt;
                    query_before(query_obj, new_date, record_list, callback_ok, callback_fail)
                } else {
                    callback_ok(record_list);
                }
            }, callback_fail)
        };

        var now = new Date();
        query_before(query_obj, now, [], callback_ok, callback_fail);
    },
    find_delay: function (query_obj, callback_ok, callback_fail, delay_ms, try_count) {
        delay_ms = delay_ms ? delay_ms : TabUtil.delay_ms;
        setTimeout(function () {
            TabUtil.find(query_obj, callback_ok, callback_fail, try_count);
        }, Math.random() * delay_ms + 50);
    }
};

module.exports = TabUtil;