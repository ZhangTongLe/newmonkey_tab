/**
 * Created by kangtian on 16/9/12.
 */

var TabUtil = {
    save: function (record, callback, try_count) {
        if (try_count == undefined)
            try_count = 0;
        if (try_count > 5)
            console.error("save failed.\n" + JSON.stringify(record));
        record.save().then(function (record) {
            if (callback)
                callback(record);
        }, function (error) {
            if (error.message.indexOf('A unique field was given a value that is already taken.') > 0)
                console.log(error.message);
            else if (error.message.indexOf('Too many requests.') > 0){
                setTimeout(function () {
                    this.save(record, callback, try_count + 1);
                }, Math.random() * 1000 + 50);
            }
            else
                throw (error);
        })
    }
};

module.exports = TabUtil;