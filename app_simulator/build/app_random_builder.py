# -*- coding: UTF-8 -*-

import random
from faker import Faker
from models.app import Application, Activity, Widget, Position
from models.event import BasicEventHandler

fake = Faker()


class AppRandomBuilder(object):
    def __init__(self):
        pass

    def get_identify(self):
        return fake.name().replace(' ', '_')

    def gen_widget(self):
        widget = Widget(identify='button_%s' % self.get_identify(), t=Widget.BUTTON, position=None)
        y1, x1 = random.randint(0, 300), random.randint(0, 300)
        y2, x2 = y1 + random.randint(50, 100), x1 + random.randint(50, 100)
        widget.position = Position(Position.RECT, x1, y1, x2, y2)
        return widget

    def gen_activity(self, widget_num=None):
        widget_num = widget_num or random.randint(4, 10)
        activity = Activity(identify='activity_%s' % self.get_identify())
        for i in range(widget_num):
            activity.add(self.gen_widget())
        return activity

    def gen_event(self, app):
        src_activity = random.choice(app.sub_list)
        src_widget = random.choice(src_activity.sub_list)
        dst_activity = random.choice(app.sub_list)
        src_widget.bind('click', BasicEventHandler.gen_push_activity(app, dst_activity))

    def gen_app(self, seed=8888, activity_num=None, event_num=None):
        activity_num = activity_num or random.randint(4, 20)
        # fake.seed(seed)
        app = Application(identify='RandomApp_%s' % seed)
        for i in range(activity_num):
            app.add(self.gen_activity())

        app.push_activity(app.sub_list[0])

        event_num = int(event_num or sum([len(a) for a in app.sub_list if a]) * 0.5)    # 总控件数的一半
        for i in range(event_num):
            self.gen_event(app)
        return app


def gen_app_example():
    app = Application(identify='QQ')
    activity_aio = Activity(identify='aio')
    button_jump = Widget(identify='button_jump', t=Widget.BUTTON, position=Position(Position.RECT, 0, 0, 100, 50))
    activity_aio.add(button_jump)
    activity_chat = Activity(identify='chat')
    app.add_list([activity_aio, activity_chat])
    app.push_activity(activity_aio)

    print app

    # bind events
    button_jump.bind('click', BasicEventHandler.gen_push_activity(app, activity_chat))
    button_jump.trigger('click')

    print app
    print button_jump

if __name__ == "__main__":
    # gen_app_example()
    a = AppRandomBuilder()
    app = a.gen_app()
    print app

