# -*- coding: UTF-8 -*-

import leancloud
import datetime

class TabReporter(object):
    def __init__(self):
        leancloud.init("2OqGTb47B0cChAg4xyOsP5D8-9Nh9j0Va", "7sOFzdMRP1D0m6r9y5LE8aPy")

    def upload_event_history(self, event_time, product, version, task_id, seq_no, event_name, event_data, pre_activity, next_activity, device):
        eh = leancloud.Object.extend('EventHistory')()
        eh.set('event_time', event_time)
        eh.set('product', product)
        eh.set('version', version)
        eh.set('task_id', task_id)
        eh.set('seq_no', seq_no)
        eh.set('event_name', event_name)
        eh.set('event_data', event_data)
        eh.set('pre_activity', pre_activity)
        eh.set('next_activity', next_activity)
        eh.set('device', device)
        eh.save()
