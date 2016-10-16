/**
 * Created by kangtian on 16/9/13.
 *
 * Note:
 *     Task Detail: /monkey/taskDetail?task_id=xyz
 */


var url_get_configs = '/monkey/getTaskConfigs/';
var url_modify_config = '/monkey/modifyTaskConfig/';
var url_delete_config = '/monkey/deleteTaskConfig/';

var table_name = 'config-list-table';

function init_table(){
    var $table = $('#'+table_name);
    $table.bootstrapTable('destroy');
    var columns = [
        {field: 'task_name', title: '任务名称', sortable: true},
        {field: 'product_name', title: '产品', sortable: true},
        {field: 'who_update', title: '最后修改人'},
        {field: 'operation', title: '操作'}
    ];

    $table.bootstrapTable({
        search: true,
        columns: columns,
        toolbar: '#config-list-toolbar'
    });
}


function table_load($table, records) {
    for(var i = 0; i < records.length; i ++){
        var r = records[i];
        var modify_template = '<a target="_blank" href="{modify_url}?task_name={task_name}"><i style="font-size: 20px" class="material-icons">mode_edit</i>修改</a>';
        var delete_template = '<a href="javascript: delete_config(\'{task_name}\')"><i style="font-size: 20px" class="material-icons">delete</i>删除</a>';
        r.operation = replace_with_map(modify_template + '&nbsp;&nbsp;' + delete_template, {
            '{delete_url}': url_delete_config, '{task_name}': r.task_name, '{modify_url}': url_modify_config
        });
    }
    $table.bootstrapTable('load', records);
}


function do_filter() {
    show_loading('div_loading');
    var $table = $('#'+table_name);
    $.ajax({
        url: url_get_configs,
        type: "GET",
        dataType: 'json',
        success: function (resp) {
            console.log(resp);
            hide_loading('div_loading');
            if (resp.status == 'ok') {
                table_load($table, resp.data);
                scroll_to_elem(table_name);
            } else {
                Materialize.toast(resp.data, 30000);
            }
        }
    });
}

function delete_config(task_name) {
    show_loading('div_loading');
    $.ajax({
        url: url_delete_config,
        type: "GET",
        dataType: 'json',
        data: {task_name: task_name},
        success: function (resp) {
            console.log(resp);
            hide_loading('div_loading');
            if (resp.status == 'ok') {
                Materialize.toast('删除配置成功, 稍后将重新加载...', 4000);
                setTimeout(do_filter, 4000)
            } else {
                Materialize.toast('失败: ' + resp.data, 30000);
            }
        }
    });
}


$(document).ready(function(){
    init_table();
    do_filter();
});
