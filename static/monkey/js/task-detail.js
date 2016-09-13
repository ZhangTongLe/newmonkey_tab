/**
 * Created by kangtian on 16/9/14.
 */

var url_do_update = '/monkey/taskDetailUpdate/';
var task_acr_id = 'task_acr';


function do_update() {
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
                var acr_text = (acr['coverage_rate']*100).toFixed(1) + ' % ('+ acr['cover_num'] + '/' + acr['total_num'] +')';
                $('#'+task_acr_id).text(acr_text);
            } else {
                alert(resp.data);
            }
        }
    });
}


$(document).ready(function(){
    do_update();
});
