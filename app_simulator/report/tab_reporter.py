# -*- coding: UTF-8 -*-

import leancloud
import datetime

class TabReporter(object):
    def __init__(self):
        leancloud.init("2OqGTb47B0cChAg4xyOsP5D8-9Nh9j0Va", "7sOFzdMRP1D0m6r9y5LE8aPy")

    def upload_event_history(self, event_object):
        eh = leancloud.Object.extend('EventHistory')()
        for key in event_object:
            eh.set(key, event_object[key])
        eh.save()
