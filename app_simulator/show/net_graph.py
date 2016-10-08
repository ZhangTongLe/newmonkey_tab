# -*- coding: UTF-8 -*-

import requests
import json

from tab.monkey import MonkeyTab
from models.event import MonkeyEvent


class NetGraph(object):
    def __init__(self):
        self.upload_url = 'http://localhost:3000/service/plotNetGraphUpload/'

    def upload_to_web(self, name, graph_type, data):
        resp = requests.post(self.upload_url, data=dict(
            name=name,
            graph_type=graph_type,
            data=json.dumps(data)
        ))
        print resp.text
        return resp

    def gen_net_graph_data_from_status_map(self, status_map):
        node_map = dict()
        edge_map = dict()
        node_index = 0
        edge_index = 0
        for r in status_map:
            pre_activity = r['pre_activity']
            next_activity = r['next_activity']
            event_identify = r['event_identify']
            if pre_activity not in node_map:
                node_map[pre_activity] = {'id': node_index, 'title': pre_activity, 'label': pre_activity, 'value': 1}
                node_index += 1
            if next_activity not in node_map:
                node_map[next_activity] = {'id': node_index, 'title': next_activity, 'label': next_activity, 'value': 1}
                node_index += 1
            if event_identify not in edge_map:
                edge_map[event_identify] = {
                    'id': edge_index, 'title': event_identify, 'value': 1,
                    'from': node_map[pre_activity]['id'], 'to': node_map[next_activity]['id'], 'arrows': 'to',
                    'seq_no': r.get('seq_no')
                }
                edge_index += 1
            else:
                edge_map[event_identify]['value'] += 1

            node_map[pre_activity]['value'] += 1
            node_map[next_activity]['value'] += 1
        node_list = node_map.values()
        edge_list = edge_map.values()
        print 'net_graph_data: len(node): %s, len(edge): %s' % (len(node_list), len(edge_list))
        return dict(node_list=node_list, edge_list=edge_list)

    def gen_net_graph_data_from_event_history(self, event_history):
        node_map = dict()
        edge_map = dict()
        node_index = 0
        edge_index = 0
        for index, r in enumerate(event_history):
            pre_activity = r['pre_activity']
            if not r.get('next_activity', None):
                r['next_activity'] = event_history[index + 1]['pre_activity'] if index < len(event_history) - 1 else ''
            next_activity = r['next_activity']
            event_identify = MonkeyEvent.get_event_identify(r)
            if pre_activity not in node_map:
                node_map[pre_activity] = {'id': node_index, 'title': pre_activity, 'label': pre_activity, 'value': 1}
                node_index += 1
            if next_activity not in node_map:
                node_map[next_activity] = {'id': node_index, 'title': next_activity, 'label': next_activity, 'value': 1}
                node_index += 1
            if event_identify not in edge_map:
                edge_map[event_identify] = {
                    'id': edge_index, 'title': event_identify, 'value': 1,
                    'from': node_map[pre_activity]['id'], 'to': node_map[next_activity]['id'], 'arrows': 'to',
                    'seq_no': r.get('seq_no')
                }
                edge_index += 1
            else:
                edge_map[event_identify]['value'] += 1

            node_map[pre_activity]['value'] += 1
            node_map[next_activity]['value'] += 1
        node_list = node_map.values()
        edge_list = edge_map.values()
        print 'net_graph_data: len(node): %s, len(edge): %s' % (len(node_list), len(edge_list))
        return dict(node_list=node_list, edge_list=edge_list)

if __name__ == "__main__":
    n = NetGraph()
    status_map = MonkeyTab().get_status_map('com.tencent.mobileqq', '6.5.8')
    net_graph_data = n.gen_net_graph_data_from_status_map(status_map)
    n.upload_to_web('QQ-6.5.8', 'net_graph', net_graph_data)
    print len(json.dumps(net_graph_data, indent=4))
