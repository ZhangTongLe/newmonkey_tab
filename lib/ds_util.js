/**
 * Created by kangtian on 16/9/22.
 */

function set2list(set_obj) {
    var l = [];
    set_obj.forEach(function (i) {l.push(i)});
    return l;
}

function list_distinct(list_obj) {
    var s = new Set();
    list_obj.forEach(function (i) {
        s.add(i);
    });
    return set2list(s);
}

function is_type(obj, type) {
    return Object.prototype.toString.call(obj) == '[object '+ type +']';
}

var DsUtil = {
    set2list: set2list,
    list_distinct: list_distinct,
    is_type: is_type
};


module.exports = DsUtil;