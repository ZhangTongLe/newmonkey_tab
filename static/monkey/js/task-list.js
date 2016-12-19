/**
 * Created by kangtian on 16/9/13.
 *
 * Note:
 *     Task Detail: /monkey/taskDetail?task_id=xyz
 */


var url_do_filter = '/monkey/getTaskList/';
var url_task_detail = '/monkey/taskDetail?task_id=';
var url_product_ver_detail = '/monkey/ProductVerDetail?product=';
var table_name = 'task-list-table';

function init_table(){
    var $table = $('#'+table_name);         // table哪里来的？？？
    $table.bootstrapTable('destroy');
    var columns = [
        {field: 'task_id', title: '任务ID'},
        {field: 'product', title: '产品'},
        {field: 'version', title: 'App版本', sortable: true},
        {field: 'device', title: '设备'},
        {field: 'start_time',title: '起始时间'},
        {field: 'last_time',title: '结束时间'},
        {field: 'costtime', title: '耗时'}
    ];

    $table.bootstrapTable({
        pagination: true,
        pageSize: 15,
        pageList: [10, 15, 30, 50, 200, 'All'],
        search: true,
        columns: columns,
        sortName: 'task_id',
        sortOrder: 'desc'
    });

}

function table_load($table, records) {
    for(var i = 0; i < records.length; i ++){
        var r = records[i];                     // records中的数据为对象，r相当于指向对象的指针，所以对r操作也就改变了records中数据的值
        r.task_id = '<a target="_blank" href="'+ url_task_detail+r.task_id +'">'+ r.task_id +'</a>';
        r.version = '<a target="_blank" href="'+ url_product_ver_detail+r.product+'&version='+r.version +'">'+ r.version +'</a>';

        t1 = new Date(r.start_time.iso);     //把格式化的日期数据转化为Date类型的数据然后再进行处理
        t2 = new Date(r.last_time.iso);
        r.start_time = r.start_time.iso;
        r.last_time = r.last_time.iso;
        // console.log(typeof(t2-t1));

        r.costtime = (t2 - t1)/1000 + ' s';
        // r.costtime = (r.last_time - r.start_time)/1000 + ' s';
    }
    $table.bootstrapTable('load', records);
}

function get_selector_val($select) {
    var val = $select.val();
    return val.indexOf('--') == 0 ? null : val;
}


function do_filter() {
    show_loading('div_loading');
    var $table = $('#'+table_name);
    $.ajax({
        url: url_do_filter,
        type: "GET",
        dataType: 'json',
        data: {
            product: get_selector_val($('#product')),
            version: get_selector_val($('#version')),
            device: get_selector_val($('#device')),
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
    $('#device').on('change', do_filter);
}


$(document).ready(function(){
    init_table();
    do_filter();
    init_select2();
    bind_events();
});



