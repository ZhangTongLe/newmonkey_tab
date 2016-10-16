/**
 * Created by kangtian on 16/10/16.
 */

function replace_with_map(s, map) {
    for (var key in map)
        if (map.hasOwnProperty(key))
            s = s.replace(new RegExp(key, 'gm'), map[key]);
    return s;
}


var StrUtil = {
    replace_with_map: replace_with_map
};


module.exports = StrUtil;