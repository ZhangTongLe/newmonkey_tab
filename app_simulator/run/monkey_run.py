# -*- coding: UTF-8 -*-

import random
import time
import datetime

from build.app_random_builder import AppRandomBuilder
from report.tab_reporter import TabReporter


class MonkeyRunner(object):
    def __init__(self, app):
        self.task_id = str(datetime.datetime.now()).replace(' ', '_')
        self.app = app
        self.device = 'Nexus5'
        self.reporter = TabReporter()

    def start(self):
        for seq_no in range(200):
            event_info = self.random_event()
            event_info['seq_no'] = seq_no
            self.reporter.upload_event_history(**event_info)
            print '\n' + '-'*50 + '\n%s' % self.app
            time.sleep(0.001)

    def random_event(self):
        random_widget = random.choice(self.app.current_activity.sub_list)
        random_widget.trigger('click')
        event_info = self.gather_event_upload_before('click', random_widget.description)
        return event_info

    def gather_event_upload_before(self, event_name, event_data, event_info=None):
        event_info = event_info or dict()
        pre_activity = self.app.current_activity.identify
        event_info.update(dict(
            event_name=event_name,
            event_data=event_data,
            pre_activity=pre_activity,
            next_activity='',
        ))
        event_info['event_time'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")
        event_info['product'] = self.app.identify
        event_info['version'] = self.app.version
        event_info['task_id'] = self.task_id
        event_info['device'] = self.device
        return event_info


if __name__ == '__main__':
    app = AppRandomBuilder().gen_app(seed=8001)
    monkey = MonkeyRunner(app)
    monkey.start()
