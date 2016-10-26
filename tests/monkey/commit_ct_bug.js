// onclick="commit_bug(this)"

function commit_bug(elem) {
    var $this = $(elem);
    var commit_url = 'http://magnifier.oa.com/v4/apmandroid/commitCTTreeBug/';

    function find_root() {
        var $parent = $this;
        var $parent_list = [$parent];
        var deep = 0;
        while (true) {
            if (deep > 128)    // 最大递归层数
                return null;
            console.log($parent[0].tagName);
            if ($parent.hasClass('datagrid-body')) {    // 到达 table body 节点
                return $parent_list[$parent_list.length - 3];    // 不管怎样, 确实是这个...
            } else {
                $parent_list.push($parent);
                $parent = $parent.parent();
            }
            deep += 1;
        }
    }

    function gather_info_of_node($node, node_info) {
        if ($node.hasClass('datagrid-row')) {
            node_info['name'] = $node.find('[field=name]').text();
            node_info['color'] = $node.find('[field=name]').find('.tree-title span').css('color');
            node_info['totalcosttime'] = $node.children('[field=totalcosttime]').text();
            node_info['count'] = $node.children('[field=total]').text();
            node_info['avg'] = $node.children('[field=avgcosttime]').text();
            node_info['ratio'] = $node.children('[field=progress]').text().replace('%', '');
            node_info['ratio'] = parseFloat(node_info['ratio']) / 100.0 || 0;
            node_info['ratio_for_root'] = $node.children('[field=progresstotal]').text();
        } else {
            console.error('$node must has class: datagrid-row')
        }
    }

    function ergodic_sub_nodes($node, info) {
        if ($node.hasClass('datagrid-row') && $node.next().hasClass('treegrid-tr-tree')) {
            // 不需要做任何事, 由子节点补充信息.
        } else if ($node.hasClass('datagrid-row') && ! $node.next().hasClass('treegrid-tr-tree')) {
            gather_info_of_node($node, info);    // 已经是叶子节点.
        } else if ($node.hasClass('treegrid-tr-tree')) {
            gather_info_of_node($node.prev(), info);
            info['sub_list'] = [];
            $node.children('td').children('div').children('table').children('tbody').children().each(function (idx) {
                var $this = $(this);
                if ($this.hasClass('datagrid-row') && $this.next().hasClass('treegrid-tr-tree')) {
                    return; // 不需要做任何事, 由子节点补充信息.
                }
                var sub_info = {};
                info['sub_list'].push(sub_info);
                console.log('sub_row: ' + idx + '\n' + $(this).html());
                ergodic_sub_nodes($(this), sub_info);
            })
        } else {
            console.error('can not accept node type.');
        }
    }

    function do_format_to_commit_bug(info) {    // 将 sub_list 替换为函数名作为 Key 的对象, 这个数据结构真心别扭
        info.call = {};
        if (info.sub_list) {
            for (var i = 0; i < info.sub_list.length; i ++) {
                var sub_node = info.sub_list[i];
                info.call[sub_node.name] = do_format_to_commit_bug(sub_node);
            }
            delete info.sub_list;
        }
        return info;
    }

    function gen_bug_info() {
        var $root = find_root();
        var bug_info = {};
        bug_info.stack = {};
        bug_info.product_name = '手机QQ(Android)';    // TODO
        bug_info.version = "6.5.8";    // TODO
        ergodic_sub_nodes($root, bug_info.stack);
        do_format_to_commit_bug(bug_info.stack);
        bug_info.title = 'avg: ' + bug_info.stack.avg + ', ' + bug_info.stack.name;
        return bug_info;
    }

    function do_commit() {
        var bug_info = gen_bug_info();
        console.log('bug_info: ' + JSON.stringify(bug_info));

        // TODO, 跨域访问会失败, 服务后台做转发.
        $.ajax({
            url: commit_url,
            type: "POST",
            dataType: 'json',
            data: Object.assign(bug_info),
            success: function (resp) {
                console.log(resp);
            }
        });
    }

    do_commit();
    return this;
}