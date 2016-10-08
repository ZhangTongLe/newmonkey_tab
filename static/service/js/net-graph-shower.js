/**
 * Created by kangtian on 16/9/16.
 */

var url_get_graph_records = '/service/plotGetGraphData/';


function update_net_graph(node_edge) {
    var nodes = new vis.DataSet({});
    var edges = new vis.DataSet({});

    if (! node_edge) {
        alert('获取数据失败, 请检查 id: ' + para.id);
        return;
    }

    node_edge['node_list'].forEach(function (r) {
        nodes.add(r)
    });
    node_edge['edge_list'].forEach(function (r) {
        edges.add(r)
    });

    console.log(node_edge);

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

    var container = document.getElementById('net_graph');
    var network = new vis.Network(container, data, options);
}


function update_activity_network(para) {
    show_loading('div_loading');
    $.ajax({
        url: url_get_graph_records,
        type: "POST",
        dataType: 'json',
        data: {
            id: para.id
        },
        success: function (resp) {
            hide_loading('div_loading');
            console.log(resp);
            if (resp.status == 'ok') {
                update_net_graph(resp.data.data);
            } else {
                alert(resp.data);
            }
        }
    });
}

$(document).ready(function(){
    update_activity_network(para);
});