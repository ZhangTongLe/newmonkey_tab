function show_loading(elem_id){
    $('#'+elem_id).show();
}

function hide_loading(elem_id){
    $('#'+elem_id).hide();
}

function scroll_to_elem(elem_id, ms){
    $("html,body").animate({
        scrollTop: $("#"+elem_id).offset().top
    }, ms);
}