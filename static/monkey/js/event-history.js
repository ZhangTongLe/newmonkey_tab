/**
 * Created by kangtian on 16/9/13.
 *
 * Note:
 *     Task Detail: /monkey/taskDetail?task_id=xyz
 */


var url_do_filter = '/monkey/eventHistoryFilter/';
var url_task_detail = '/monkey/taskDetail?task_id=';
var table_name = 'event-history-table';

function init_table(){
    var $table = $('#'+table_name);
    $table.bootstrapTable('destroy');
    var columns = [
        {field: 'task_id', title: '任务ID'},
        {field: 'product', title: '产品'},
        {field: 'version', title: 'App版本', sortable: true},
        {field: 'device', title: '设备'},
        {field: 'seq_no', title: '序号'},
        {field: 'event_name', title: '事件'},
        {field: 'pre_activity', title: 'Pre Activity'},
        {field: 'next_activity', title: 'Next Activity'}
    ];

    $table.bootstrapTable({
        pagination: true,
        pageSize: 15,
        pageList: [10, 15, 30, 50, 200, 'All'],
        search: true,
        columns: columns,
        sortName: 'version',
        sortOrder: 'desc'
    });
}


function table_load($table, records) {
    for(var i = 0; i < records.length; i ++){
        var r = records[i];
        r.task_id = '<a target="_blank" href="'+ url_task_detail+r.task_id +'">'+ r.task_id +'</a>';
    }
    $table.bootstrapTable('load', records);
}

function get_selector_val($select) {
    var val = $select.val();
    return val.indexOf('--') == 0 ? null : val;
}


function do_filter() {
    var $table = $('#'+table_name);
    $.ajax({
        url: url_do_filter,
        type: "POST",
        dataType: 'json',
        data: {
            product: get_selector_val($('#product')),
            version: get_selector_val($('#version')),
            device: get_selector_val($('#device'))
        },
        success: function (resp) {
            console.log(resp);
            hide_loading('div_loading');
            if (resp.status == 'ok') {
                table_load($table, resp.data);
                scroll_to_elem(table_name);
            } else {
                alert(resp.data);
            }
        }
    });
}

function init_select2() {
    $('.select2').select2({
        minimumResultsForSearch: 7,
        placeholder: {
            id: "1",
            placeholder: "Select an option"
        }
    })
}

function bind_events() {
    $('#product').on('change', do_filter);
    $('#version').on('change', do_filter);
    $('#device').on('change', do_filter);
}


$(document).ready(function(){
    init_table();
    do_filter();
    init_select2();
    bind_events();
});



