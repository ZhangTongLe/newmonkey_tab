# -*- coding: UTF-8 -*-

import random
import time
import datetime

from build.app_random_builder import AppRandomBuilder
from build.app_sm_builder import AppSMBuilder
from report.tab_reporter import TabReporter
from models.event import EventType
from show.net_graph import NetGraph


random.seed(234)


class MonkeyRunner(object):
    def __init__(self, app, do_upload_event_history=False, do_upload_net_graph=True, show_details=False):
        self.do_upload_event_history = do_upload_event_history
        self.do_upload_net_graph = do_upload_net_graph
        self.show_details = show_details
        self.task_id = str(datetime.datetime.now()).replace(' ', '_')
        self.app = app
        self.app.version = random.choice(['1.0.2', '6.5.8', '6.5.5', '1.0.3'])
        self.app.version = '1.0.3'
        self.device = random.choice(['Nexus5', 'MX4Pro', 'R819T', 'SM-G7106', 'GT-I9300'])
        self.device = 'MX4Pro'
        self.stat_info = dict(
            stay_same_activity_count=0
        )
        self.reporter = TabReporter()

    def start(self, event_num=100, event_cost_ms=10):
        event_list = []
        for seq_no in range(event_num):
            event_object = self.random_event()
            event_object['seq_no'] = seq_no
            if self.do_upload_event_history:
                self.reporter.upload_event_history(event_object=event_object)
            event_list.append(event_object)
            if self.show_details:
                print '\n' + '-'*50 + '\n%s' % self.app
            time.sleep(event_cost_ms / 1000.0)
        if self.do_upload_net_graph:
            net_graph = NetGraph()
            net_graph_data = net_graph.gen_net_graph_data_from_event_history(event_list)
            resp = net_graph.upload_to_web('%s--%s.%s' % (self.app.identify, self.app.version, self.task_id), 'net_graph', net_graph_data)
            print resp.text

    def get_random_widget(self, method='jump_when_locked'):
        if method == 'jump_when_locked':
            while True:
                if not self.app.current_activity.sub_list or self.stat_info['stay_same_activity_count'] > 8:
                    activity = random.choice(self.app.sub_list)
                else:
                    activity = self.app.current_activity
                if len(activity) > 0:
                    break
            random_widget = random.choice(activity.sub_list)
        elif method == 'random_choice':
            if not self.app.current_activity.sub_list:    # 没有可以操作的控件
                print '=' * 20 + '空的Activity' + '=' * 20
                print self.app.current_activity
                activity = random.choice(self.app.sub_list)
            else:
                activity = self.app.current_activity
            random_widget = random.choice(activity.sub_list)
        return random_widget

    def random_event(self):
        trigger_event = EventType.CLICK
        event_data = dict()
        random_widget = self.get_random_widget(method='random_choice')
        event_data['event_entity'] = random_widget.description
        event_data['event_name'] = str(trigger_event)
        event_object = self.gather_event_upload_before(trigger_event, event_data)
        if len(self.app.current_activity.sub_list) == 0:
            self.app.pop_activity()    # 回退
        resp_num = random_widget.trigger(trigger_event, single_mode=True)
        if event_object['pre_activity'] == self.app.current_activity.identify:
            self.stat_info['stay_same_activity_count'] += 1
        else:
            self.stat_info['stay_same_activity_count'] = 0
        print 'EVENT: %s -- %s' % (event_object['pre_activity'], self.app.current_activity.identify)
        return event_object

    def gather_event_upload_before(self, event_name, event_data, event_object=None):
        event_object = event_object or dict()
        pre_activity = self.app.current_activity.identify
        event_object.update(dict(
            event_name=event_name,
            event_data=event_data,
            pre_activity=pre_activity,
            next_activity='',
        ))
        event_object['event_time'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")
        event_object['product'] = self.app.identify
        event_object['version'] = self.app.version
        event_object['task_id'] = self.task_id
        event_object['device'] = self.device
        return event_object


if __name__ == '__main__':
    app = AppSMBuilder('com.tencent.mobileqq', '6.5.8', do_reload=False).gen_app()
    monkey = MonkeyRunner(app, show_details=False)
    monkey.start(event_num=300, event_cost_ms=1)
