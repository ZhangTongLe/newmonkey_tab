/**
 * Created by kangtian on 16/9/14.
 */

var url_do_update_all = '/monkey/taskDetailUpdate/';
var url_do_update_acr = '/monkey/taskStatACR/';
var url_do_update_wcr = '/monkey/taskStatWCR/';
var url_do_update_ecr = '/monkey/taskStatECR/';


function do_update_stat(url_do_update) {
    $.ajax({
        url: url_do_update,
        type: "POST",
        dataType: 'json',
        data: {
            task_id: $('#task_id').text()
        },
        success: function (resp) {
            console.log(resp);
            hide_loading('div_loading');
            if (resp.status == 'ok') {
                var acr = resp.data.acr_res;
                if (acr){
                    var acr_text = (acr['coverage_rate']*100).toFixed(1) + ' % ('+ acr['cover_num'] + '/' + acr['total_num'] +')';
                    var acr_html = '<a href="javascript: jump_to_stat_button(\'btn_task_activity\')">' +acr_text+ '</a>';
                    $('#task_acr').html(acr_html);
                    $('#cover_activity_list').text(acr['cover_activity_list'].join('\n'));
                    $('#sm_activity_list').text(acr['sm_activity_list'].join('\n'));
                }

                var wcr = resp.data.wcr_res;
                if (wcr){
                    var wcr_text = (wcr['coverage_rate']*100).toFixed(1) + ' % ('+ wcr['cover_num'] + '/' + wcr['total_num'] +')';
                    var wcr_html = '<a href="javascript: jump_to_stat_button(\'btn_task_widget\')">' +wcr_text+ '</a>';
                    $('#task_wcr').html(wcr_html);
                    $('#cover_widget_list').text(wcr['cover_widget_list'].join('\n'));
                    $('#sm_widget_list').text(wcr['sm_widget_list'].join('\n'));
                }

                var ecr = resp.data.ecr_res;
                if (ecr){
                    var ecr_text = (ecr['coverage_rate']*100).toFixed(1) + ' % ('+ ecr['cover_num'] + '/' + ecr['total_num'] +')';
                    var ecr_html = '<a href="javascript: jump_to_stat_button(\'btn_task_event\')">' +ecr_text+ '</a>';
                    $('#task_ecr').html(ecr_html);
                    $('#cover_event_list').text(ecr['cover_event_list'].join('\n'));
                    $('#sm_event_list').text(ecr['sm_event_list'].join('\n'));
                }
            } else {
                alert(resp.data);
            }
        }
    });
}

function change_toggle_text(){
    var html = $(this).html();
    if (html.indexOf('查看') > -1){
        $(this).html(html.replace('查看', '收起'));
    } else if (html.indexOf('收起') > -1) {
        $(this).html(html.replace('收起', '查看'));
    }
}

function jump_to_stat_button(stat_button_id) {
    scroll_to_elem(stat_button_id);
    $('#'+stat_button_id).trigger('click');
}


$(document).ready(function(){
    [url_do_update_acr, url_do_update_wcr, url_do_update_ecr].forEach(function (url) {
        do_update_stat(url);
    });
    $('#btn_task_activity').on('click', change_toggle_text);
    $('#btn_task_widget').on('click', change_toggle_text);
});
