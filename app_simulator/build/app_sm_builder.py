# -*- coding: UTF-8 -*-

import json

from faker import Faker
from models.app import Application, Activity, Widget, Position
from models.event import BasicEventHandler, EventType, MonkeyEvent
from tab.monkey import MonkeyTab

fake = Faker()


class AppSMBuilder(object):
    def __init__(self, product, version, do_reload=False):
        self.product = product
        self.version = version
        self.do_reload = do_reload

    def gen_app(self):
        app = Application(identify=self.product, version=self.version)
        app_info = dict()
        status_map = MonkeyTab().get_status_map(product=self.product, version=self.version, do_reload=self.do_reload)
        for item in status_map:
            pre_activity = item.get('pre_activity')
            next_activity = item.get('next_activity')
            event_name = item.get('event_name')
            event_entity_identify = item.get('event_entity_identify')
            if pre_activity not in app_info:
                app_info[pre_activity] = {}
            if next_activity not in app_info:
                app_info[next_activity] = {}
            event_entity_identify = MonkeyEvent.get_event_identify_from_sm(item)
            if event_entity_identify not in app_info[pre_activity]:
                app_info[pre_activity][event_entity_identify] = dict(event_name=event_name)
                # if pre_activity != next_activity and event_name == EventType.CLICK:
                app_info[pre_activity][event_entity_identify]['push_activity'] = next_activity
                # print 'event: %s - %s' % (event_name, next_activity)

        for activity_id in app_info:
            activity_info = app_info[activity_id]
            a = Activity(activity_id)
            index = 0
            for widget_id in activity_info:
                position = a.gen_widget_position(index)
                w = Widget(widget_id, 'button', position)
                a.add(w)
                index += 1
            app.add(a)

        print json.dumps(app_info['Application Error: com.tencent.mobileqq'], indent=4)

        for activity_id in app_info:
            activity = app.find(activity_id)
            activity_info = app_info[activity_id]
            for widget_id in activity_info:
                widget = activity.find(widget_id)
                widget_info = activity_info[widget_id]
                if widget_info.get('event_name', None):
                    if widget_info.get('push_activity', None):
                        to_activity = widget_info.get('push_activity')
                        widget.bind(widget_info['event_name'], BasicEventHandler.gen_push_activity(app, to_activity))
        app.push_activity(app.find('com.tencent.mobileqq.activity.SplashActivity'))
        print app
        return app


if __name__ == "__main__":
    a = AppSMBuilder('com.tencent.mobileqq', '6.5.8')
    print a.gen_app()
