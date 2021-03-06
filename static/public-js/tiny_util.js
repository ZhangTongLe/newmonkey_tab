function show_loading(elem_id){
    $('#'+elem_id).show();
}

function hide_loading(elem_id){
    $('#'+elem_id).hide();
}

function scroll_to_elem(elem_id, ms){
    if (ms = undefined)
        ms = 1000;
    $("html,body").animate({
        scrollTop: $("#"+elem_id).offset().top
    }, ms);
}

function replace_with_map(s, map) {
    for (var key in map)
        if (map.hasOwnProperty(key))
            s = s.replace(new RegExp(key, 'gm'), map[key]);
    return s;
}