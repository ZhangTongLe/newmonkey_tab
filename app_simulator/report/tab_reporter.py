# -*- coding: UTF-8 -*-

import leancloud
from tab.tab_util import TAB_UTIL


class TabReporter(object):
    def upload_event_history(self, event_object, merged_upload=False):
        eh = leancloud.Object.extend('EventHistory')()
        if not merged_upload:
            for key in event_object:
                eh.set(key, event_object[key])
            eh.save()
        else:
            TAB_UTIL.merged_save(event_object, [
                'event_data', 'pre_activity', 'next_activity', 'device', 'event_time', 'seq_no', 'event_name',
                'is_tree_changed', 'is_activity_changed', 'related_activity'
            ])

