/**
 * Created by kangtian on 16/10/22.
 */


var TABLES_DEFINE = {
    'Activity': {
        distinct_index_fields: ['DNA', 'name'],
        need_update_fields: [],
        support_cache_save: true
    },
    'View': {
        distinct_index_fields: ['activity', 'path'],
        need_update_fields: ['description', 'viewId', 'isClicked', 'nextActivity', 'isActivityChanged', 'isTreeChanged', 'text'],
        support_cache_save: true
    },
    'StatusMap': {
        distinct_index_fields: ['event_identify', 'product', 'version'],
        need_update_fields: [],
        support_cache_save: true
    },
    'EventHistory': {
        merge_fields: ['pre_activity', 'next_activity', 'event_data', 'device', 'event_time', 'seq_no', 'event_name'],
        support_merge_fields: true
    }
};


function get_distinct_index_fields(class_name) {
    return TABLES_DEFINE[class_name]['distinct_index_fields']
}


function get_need_update_fields(class_name) {
    return TABLES_DEFINE[class_name]['need_update_fields']
}


function get_merge_fields(class_name) {
    return TABLES_DEFINE[class_name]['merge_fields']
}


function get_class_config(class_name) {
    return TABLES_DEFINE[class_name]
}


var TablesMeta = {
    get_distinct_index_fields: get_distinct_index_fields,
    get_need_update_fields: get_need_update_fields,
    get_merge_fields: get_merge_fields,
    get_class_config: get_class_config
};

module.exports = TablesMeta;