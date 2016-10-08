# -*- coding: UTF-8 -*-

import leancloud
from tab.tab_util import TAB_UTIL


class TabReporter(object):
    def upload_event_history(self, event_object):
        eh = leancloud.Object.extend('EventHistory')()
        for key in event_object:
            eh.set(key, event_object[key])
        eh.save()
