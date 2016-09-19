/**
 * Created by kangtian on 16/9/16.
 */

var url_get_task_records = '/monkey/NetGraphFilterEvent/';


function update_activity_network_with_records(records, para) {
    var nodes = new vis.DataSet({});
    var edges = new vis.DataSet({});

    var node_map = {};
    var node_index = 0;
    var edge_map = {};
    var edge_index = 0;

    for (var i = 0; i < records.length; i ++){
        var r = records[i];

        if (node_map[r['pre_activity']] == undefined){
            node_map[r['pre_activity']] = {id: node_index ++, title: r['pre_activity'], label: r['pre_activity'], value: 1};
        }
        if (node_map[r['next_activity']] == undefined){
            node_map[r['next_activity']] = {id: node_index ++, title: r['next_activity'], label: r['next_activity'], value: 1};
        }

        if (edge_map[r['event_entity_identify']] == undefined){
            edge_map[r['event_entity_identify']] = {
                id: edge_index ++, title: r['event_entity_identify'], value: 1,
                from: node_map[r['pre_activity']].id, to: node_map[r['next_activity']].id, arrows: 'to',
                seq_no: r['seq_no']
            };
        } else {
            edge_map[r['event_entity_identify']].value += 1;
        }

        node_map[r['pre_activity']].value += 1;
        node_map[r['next_activity']].value += 1;
    }

    for (var key_node in node_map){
        nodes.add(node_map[key_node]);
    }

    for (var key_edge in edge_map){
        edges.add(edge_map[key_edge]);
    }

    console.log('edge_map + node_map');
    console.log(edge_map);
    console.log(node_map);

    var data = {
        nodes: nodes,
        edges: edges
    };

    var options = {
        height: '100%',
        width: '100%',
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
            arrows: {
                to: {
                    enabled: true,
                    scaleFactor: 0.4
                }
            },
            font: {align: 'middle', size: 8},
            scaling: {
                min: 1,
                max: 5
            },
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