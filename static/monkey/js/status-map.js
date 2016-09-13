/**
 * Created by kangtian on 16/9/13.
 */


var url_do_filter = '/stat/statusMapFilter/';
var table_name = 'sm-table';

function init_table(){
    var $table = $('#'+table_name);
    $table.bootstrapTable('destroy');
    var columns = [
        {field: 'product', title: '产品'},
        {field: 'version', title: 'App版本', sortable: true},
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
    $table.bootstrapTable('load', records);
}


function do_filter() {
    var $table = $('#'+table_name);
    $.ajax({
        url: url_do_filter,
        type: "POST",
        dataType: 'json',
        data: {
            product: $('#product').val(),
            version: $('#version').val()
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
        minimumResultsForSearch: 7
    })
}

function bind_events() {
    $('#product').on('change', do_filter);
    $('#version').on('change', do_filter);
}

$(function () {
    init_select2();
    init_table();
    do_filter();
    bind_events();
});



