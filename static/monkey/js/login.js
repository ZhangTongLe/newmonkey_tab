/**
 * Created by yuan on 2016/12/15.
 */

var url_do_verify = '/users/login/';

function post_message(){
    $.ajax({
        url: url_do_verify,
        credentials: 'include',
        type: "POST",
        dataType: 'json',
        data: {
            username: $('#username').val(),
            password: $('#password').val(),
        },
        // success: function (resp) {
        //     console.log(resp);
        //     if (resp.status == 'ok') {
        //         alert('success');
        //         console.log(resp.data);
        //     //     table_load($table, resp.data);
        //     //     scroll_to_elem(table_name);
        //     } else {
        //         alert('fail');
        //     }
        // }
        success: function (data) {
            // console.log(data);
            if(data.status == 'ok'){
                alert('success!');
                // var token = data.data;
                window.location.href = '/';          // 通过window.location.href实现网页的跳转,'/' 是主机端口后面的绝对路径
            } else {
                alert('fail!');
            }
        }
    });
}

// function setCookie(name, value)
// {
//     var Days = 30;
//     var exp = new Date();
//     exp.setTime(exp.getTime() + Days*24*60*60*1000);
//     document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
// }