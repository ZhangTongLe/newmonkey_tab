# -*- coding: UTF-8 -*-

import random
import time
import datetime

from build.app_random_builder import AppRandomBuilder
from report.tab_reporter import TabReporter
from models.event import EventType


class MonkeyRunner(object):
    def __init__(self, app):
        self.task_id = str(datetime.datetime.now()).replace(' ', '_')
        self.app = app
        self.app.version = random.choice(['1.0.2', '6.5.8', '6.5.5', '1.0.3'])
        self.device = random.choice(['Nexus5', 'MX4Pro', 'R819T', 'SM-G7106', 'GT-I9300'])
        self.device = 'MX4Pro'
        self.reporter = TabReporter()

    def start(self):
        for seq_no in range(10):
            event_object = self.random_event()
            event_object['seq_no'] = seq_no
            self.reporter.upload_event_history(event_object=event_object)
            print '\n' + '-'*50 + '\n%s' % self.app
            time.sleep(0.001)

    def random_event(self):
        trigger_event = EventType.CLICK
        random_widget = random.choice(self.app.current_activity.sub_list)
        random_widget.trigger(trigger_event)
        event_data = dict()
        event_data['event_entity'] = random_widget.description
        event_data['event_name'] = str(trigger_event)
        event_object = self.gather_event_upload_before(trigger_event, event_data)
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
    app = AppRandomBuilder().gen_app(seed=8001)
    monkey = MonkeyRunner(app)
    monkey.start()
