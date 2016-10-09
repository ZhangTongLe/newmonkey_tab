/**
 * Created by kangtian on 16/9/14.
 */

var url_timeline_do_update = '/monkey/taskStatByStep/';


function load_timeline(stat_list) {
    var acr_list = [], wcr_list = [], ecr_list = [], label_list = [];
    var acr_total = stat_list[0]['stat']['acr']['total_num'], wcr_total = stat_list[0]['stat']['wcr']['total_num'], ecr_total = stat_list[0]['stat']['ecr']['total_num'];
    for (var i = 0; i < stat_list.length; i ++) {
        acr_list.push(stat_list[i]['stat']['acr']['coverage_rate'].toFixed(3) * 100);
        wcr_list.push(stat_list[i]['stat']['wcr']['coverage_rate'].toFixed(3) * 100);
        ecr_list.push(stat_list[i]['stat']['ecr']['coverage_rate'].toFixed(3) * 100);
        var time = stat_list[i]['step_start_time'];
        label_list.push(moment(time).format('HH:mm:ss'));
    }
    $('#acr_timeline').highcharts({
        title: {
            text: '',
            x: -20    //center
        },
        xAxis: {
            categories: label_list
        },
        yAxis: {
            title: {
                text: '占比 (%)'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            headerFormat: '<b>{series.name}</b><br />',
            pointFormat: '{point.y} %'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: [{
            name: 'Activity 覆盖率(' + acr_total + ')',
            data: acr_list
        }, {
            name: '控件覆盖率(' + wcr_total + ')',
            data: wcr_list
        }, {
            name: '事件覆盖率(' + ecr_total + ')',
            data: ecr_list
        }]
    });
}

function do_update_timeline(url_do_update, para_dict) {
    show_loading('div_loading');
    $.ajax({
        url: url_do_update,
        type: "POST",
        dataType: 'json',
        data: {
            task_id: para_dict.task_id,
            product: para_dict.product,
            version: para_dict.version
        },
        success: function (resp) {
            hide_loading('div_loading');
            hide_loading('div_loading_timeline');
            console.log(resp);
            hide_loading('div_loading');
            if (resp.status == 'ok') {
                var stat_list = resp.data;
                load_timeline(stat_list)
            } else {
                alert(resp.data);
            }
        }
    });
}



$(document).ready(function(){
    var update_url = null;
    var para_dict = {};

    if (page_name == 'task_timeline'){
        para_dict.task_id = $('#task_id').text();
        update_url = url_timeline_do_update;
    } else if (page_name == 'version_timeline') {
        para_dict.product = $('#product').text();
        para_dict.version = $('#version').text();
        update_url = url_timeline_do_update;
    }

    do_update_timeline(update_url, para_dict);
});
