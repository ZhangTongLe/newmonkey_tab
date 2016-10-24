# -*- coding: UTF-8 -*-

import leancloud
import json
from tab.tab_util import TabUtil


class TabReporter(object):
    def upload_event_history(self, event_object, merged_upload=False):
        eh = leancloud.Object.extend('EventHistory')()
        if not merged_upload:
            for key in event_object:
                eh.set(key, event_object[key])
            eh.save()
        else:
            record_list = event_object
            tab_util = TabUtil()
            tab_util.merged_save(record_list, class_name='EventHistory')


