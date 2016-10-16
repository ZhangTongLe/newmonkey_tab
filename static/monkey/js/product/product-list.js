/**
 * Created by kangtian on 16/9/13.
 *
 * Note:
 *     Task Detail: /monkey/taskDetail?task_id=xyz
 */


var url_get_products = '/monkey/getProductList/';
var url_modify_product = '/monkey/modifyProduct/';
var url_delete_product = '/monkey/deleteProduct/';

var table_name = 'product-list-table';

function init_table(){
    var $table = $('#'+table_name);
    $table.bootstrapTable('destroy');

    var no_break_line_style = function (value, row, index, field) {
        return {
            classes: 'text-nowrap',
            css: {"white-space": "nowrap", "color": "black"}
        };
    };

    var columns = [
        {field: 'product_name', title: '产品', sortable: true},
        {field: 'package', title: '包名', sortable: true},
        {field: 'department', title: '部门'},
        {field: 'platform', title: '平台'},
        {field: 'workspace_id', title: 'Workspace ID'},
        {field: 'who_update', title: '最后更新人'},
        // {field: 'app_log_path', title: '日志路径'},
        {field: 'operation', title: '操作', cellStyle: no_break_line_style}
    ];

    $table.bootstrapTable({
        search: true,
        columns: columns,
        toolbar: '#product-list-toolbar'
    });
}


function table_load($table, records) {
    for(var i = 0; i < records.length; i ++){
        var r = records[i];
        var modify_template = '<a target="_blank" href="{modify_url}?product_name={product_name}"><i style="font-size: 20px" class="material-icons">mode_edit</i>修改</a>';
        var delete_template = '<a href="javascript: delete_product(\'{product_name}\')"><i style="font-size: 20px" class="material-icons">delete</i>删除</a>';
        r.operation = replace_with_map(modify_template + '&nbsp;&nbsp;' + delete_template, {
            '{delete_url}': url_delete_product, '{product_name}': r.product_name, '{modify_url}': url_modify_product
        });
    }
    $table.bootstrapTable('load', records);
}


function do_filter() {
    show_loading('div_loading');
    var $table = $('#'+table_name);
    $.ajax({
        url: url_get_products,
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


function delete_product(product_name) {
    show_loading('div_loading');
    $.ajax({
        url: url_delete_product,
        type: "GET",
        dataType: 'json',
        data: {product_name: product_name},
        success: function (resp) {
            console.log(resp);
            hide_loading('div_loading');
            if (resp.status == 'ok') {
                Materialize.toast('删除产品成功, 稍后将重新加载...', 4000);
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
