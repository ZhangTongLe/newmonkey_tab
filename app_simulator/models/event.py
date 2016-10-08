# -*- coding: UTF-8 -*-


class EventType(object):
    CLICK = 'click'


class EventHandler(object):
    def __init__(self, func, callback=None, *args, **kwargs):
        self.func = func
        self.callback = callback
        self.args = args
        self.kwargs = kwargs

    def __str__(self):
        return '%s' % self.kwargs


class BasicEventHandler(object):
    def __init__(self):
        pass

    @staticmethod
    def gen_push_activity(app, activity):
        return EventHandler(lambda app, activity: app.push_activity(activity), app=app, activity=activity)


class MonkeyEvent(object):

    @staticmethod
    def get_event_identify(event_info):
        SP = '^_^'
        identify = event_info.get('event_name') + SP + event_info['event_data']['event_entity']['identify'] + SP + event_info.get('pre_activity') + SP + event_info.get('next_activity')
        return identify

    @staticmethod
    def get_event_identify_from_sm(sm_record):
        SP = '^_^'
        identify = sm_record.get('event_name') + SP + sm_record.get('event_entity_identify') + SP + sm_record.get('pre_activity') + SP + sm_record.get('next_activity')
        return identify
