# -*- coding: UTF-8 -*-


class EventType(object):
    CLICK = 'click'


class EventHandler(object):
    def __init__(self, func, callback=None, *args, **kwargs):
        self.func = func
        self.callback = callback
        self.args = args
        self.kwargs = kwargs


class BasicEventHandler(object):
    def __init__(self):
        pass

    @staticmethod
    def gen_push_activity(app, activity):
        return EventHandler(lambda app, activity: app.push_activity(activity), app=app, activity=activity)
