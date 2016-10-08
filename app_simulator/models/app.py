# -*- coding: UTF-8 -*-

import traceback
import json
import random

from collections import defaultdict


class ViewBase(object):
    def __init__(self, identify):
        self.identify = identify
        self.event_pool = defaultdict(list)
        self.sub_list = []

    def bind(self, event_name, event_handler):
        self.event_pool[event_name].append(event_handler)

    def trigger(self, event_name, single_mode=False):
        """
        :param event_name:
        :param single_mode: when true, only one event will be response.
        :return:
        """
        event_handler_list = self.event_pool[event_name]
        if single_mode and event_handler_list:    # random choice one.
            event_handler_list = [random.choice(event_handler_list)]
        for e in event_handler_list:
            if len(event_handler_list) > 1:
                print 'len(event_handler_list): %s' % len(event_handler_list)
            try:
                if e.callback:
                    e.callback(e.func(*e.args, **e.kwargs))
                else:
                    e.func(*e.args, **e.kwargs)
            except:
                print 'trigger: \n%s' % traceback.format_exc()
        return len(event_handler_list)

    def add(self, sub_node):
        self.sub_list.append(sub_node)

    def add_list(self, add_sub_list):
        self.sub_list += add_sub_list

    def find(self, identify):
        hit = filter(lambda x: x.identify == identify, self.sub_list)
        return hit[0] if hit else None

    @property
    def description(self):
        return dict(identify=self.identify, len=len(self.sub_list))

    def __str__(self):
        return json.dumps(self.description, indent=4)

    def __len__(self):
        return len(self.sub_list)


class Activity(ViewBase):
    def __init__(self, identify, height=None, width=None, widget_list=None):
        super(Activity, self).__init__(identify)
        self.height = height or 1280
        self.width = width or 720

    @property
    def description(self):
        desc = super(Activity, self).description
        desc.update(dict(height=self.height, width=self.width))
        return desc

    def gen_widget_position(self, n_th):
        x_th = n_th % 3
        y_th = n_th / 3
        width = self.width / 3
        height = width / 3
        return Position(Position.RECT, x_th*width, y_th*height, x_th*(width+1)-15, y_th*(height+1)-15)


class Widget(ViewBase):
    BUTTON = 'button'

    def __init__(self, identify, t, position):
        super(Widget, self).__init__(identify)
        self.type = t
        self.position = position

    @property
    def description(self):
        desc = super(Widget, self).description
        desc.update(dict(type=self.type, position=self.position.description))
        return desc


class Application(ViewBase):
    def __init__(self, identify, version=None, home_activity=None):
        super(Application, self).__init__(identify)
        self.version = version or '1.0.0'
        self.activity_stack = [home_activity] if home_activity else []

    def get_activity(self, activity):
        if isinstance(activity, Activity):
            rel_activity = activity
        elif isinstance(activity, basestring):
            rel_activity = self.find(activity)
        else:
            raise Exception('can not accept activity type: %s' % type(activity))
        return rel_activity

    def push_activity(self, activity):
        rel_activity = self.get_activity(activity)
        if rel_activity is None:
            raise Exception('can not find activity: %s' % activity)
        self.activity_stack.append(rel_activity)

    def replace_activity(self, activity):
        rel_activity = self.get_activity(activity)
        if rel_activity is None:
            raise Exception('can not find activity: %s' % activity)
        if self.activity_stack:
            self.activity_stack.pop(-1)
        self.activity_stack.append(activity)

    def pop_activity(self):
        self.activity_stack.pop(-1)

    @property
    def current_activity(self):
        return self.activity_stack[-1] if self.activity_stack else Activity(identify='NoneActivity')

    @property
    def description(self):
        desc = super(Application, self).description
        desc.update(dict(
            activity_stack=[a.identify for a in self.activity_stack],
            current_activity=self.current_activity.description
        ))
        return desc


class Position(object):
    RECT = 'rect'

    def __init__(self, t, *args, **kwargs):
        self.type = t
        self.data = None
        if t == 'rect':
            self.rect_init(*args, **kwargs)
        else:
            raise Exception("not support Position type: %s" % t)

    def rect_init(self, x1, y1, x2, y2):
        self.data = (x1, y1, x2, y2)

    @property
    def description(self):
        return dict(type=self.type, data=self.data)

    def __str__(self):
        if self.type == 'rect':
            return json.dumps(self.description, indent=4)
        else:
            raise Exception("not support Position type: %s" % self.type)
