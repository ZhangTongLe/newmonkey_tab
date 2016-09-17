/**
 * Created by kangtian on 16/9/16.
 */

var url_get_task_records = '/monkey/NetGraphFilterEvent/';


function update_activity_network_with_records(records, para) {
    var nodes = new vis.DataSet({});
    var edges = new vis.DataSet({});

    var node_map = {};
    var edge_index = 0;

    for (var i = 0; i < records.length; i ++){
        var r = records[i];
        if (node_map[r['pre_activity']] == undefined){
            nodes.add({id: i, title: r['pre_activity'], label: r['pre_activity']});
            console.log(r['pre_activity']);
            node_map[r['pre_activity']] = i;
        } else {
            ;
        }
        edges.add({id: edge_index ++, title: r['event_entity_identify'], from: node_map[r['pre_activity']], to: node_map[r['next_activity']], arrows: 'to'});
    }

    var data = {
        nodes: nodes,
        edges: edges
    };

    var options = {
        clickToUse: para.is_click_to_use == undefined ? false : para.is_click_to_use,
        nodes: {
            shape: 'dot',
            scaling: {
                min: 10,
                max: 30
            },
            font: {
                size: 12,
                face: 'Tahoma',
                color: 'blue'
            }
        },
        edges: {
            font: {align: 'middle', size: 8},
            color:{inherit:true},
            width: 0.15,
            smooth: {
                type: 'continuous'
            }
        },
        layout: {
            randomSeed: 8888
        },
        interaction: {
            hideEdgesOnDrag: true,
            tooltipDelay: 100,
            hover: true,
            hoverConnectedEdges: true,
            dragNodes: true
        },
        physics: {
            enabled: true,
            solver: 'hierarchicalRepulsion'
        }
    };

    var container = document.getElementById('activity_network');
    console.log(container);
    var network = new vis.Network(container, data, options);
}


function update_activity_network(para) {
    if (para.task_id == undefined)
        para.task_id = $('#task_id').val();
    $.ajax({
        url: url_get_task_records,
        type: "POST",
        dataType: 'json',
        data: {
            task_id: para.task_id
        },
        success: function (resp) {
            console.log(resp);
            if (resp.status == 'ok') {
                update_activity_network_with_records(resp.data, para);
            } else {
                alert(resp.data);
            }
        }
    });
}

$(document).ready(function(){
    update_activity_network(para);
});