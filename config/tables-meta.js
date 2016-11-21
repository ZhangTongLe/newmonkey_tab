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
        distinct_index_fields: ['product', 'version', 'activity', 'path'],
        need_update_fields: ['description', 'view_id', 'next_activity', 'is_activity_changed', 'is_tree_changed', 'text'],
        support_cache_save: true
    },
    'StatusMap': {
        distinct_index_fields: ['product', 'version', 'event_identify'],
        need_update_fields: [],
        support_cache_save: true
    },
    'EventHistory': {
        merge_fields: ['pre_activity', 'next_activity', 'event_data', 'device', 'event_time', 'seq_no', 'event_name', 'is_tree_changed', 'is_activity_changed', 'related_activity', 'is_back'],
        common_fields: ['product', 'version', 'task_id'],
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


function get_common_fields(class_name) {
    return TABLES_DEFINE[class_name]['common_fields']
}


function get_class_config(class_name) {
    return TABLES_DEFINE[class_name]
}


var TablesMeta = {
    get_distinct_index_fields: get_distinct_index_fields,
    get_need_update_fields: get_need_update_fields,
    get_merge_fields: get_merge_fields,
    get_common_fields: get_common_fields,
    get_class_config: get_class_config
};

module.exports = TablesMeta;