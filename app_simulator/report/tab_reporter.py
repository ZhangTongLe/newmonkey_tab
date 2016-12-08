# -*- coding: UTF-8 -*-

import leancloud
import json
from tab.tab_util import TabUtil


class TabReporter(object):
    def upload_event_history(self, event_object, merged_upload=False):
        if not merged_upload:
            if not isinstance(event_object, list):
                event_list = [event_object]
            else:
                event_list = event_object
            for record in event_list:
                eh = leancloud.Object.extend('EventHistory')()
                for key in record:
                    eh.set(key, record[key])
                eh.save()
        else:
            record_list = event_object
            tab_util = TabUtil()
            tab_util.merged_save(record_list, class_name='EventHistory')


