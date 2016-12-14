# -*- coding: UTF-8 -*-

import leancloud
import datetime
import requests
import json

from leancloud import Object
from leancloud import Query


class TabUtil(object):
    TAB_LIMIT = 1000
    # HOST = 'https://hi-monkey.leanapp.cn'
    HOST = 'https://hi-monkey2.leanapp.cn'
    # HOST = 'http://127.0.0.1:3000'

    def __init__(self):
        # leancloud.init("2OqGTb47B0cChAg4xyOsP5D8-9Nh9j0Va", "7sOFzdMRP1D0m6r9y5LE8aPy")
        leancloud.init("2OqGTb47B0cChAg4xyOsP5D8-9Nh9j0Va", "7sOFzdMRP1D0m6r9y5LE8aPy")
        self.try_times = 3
        self.max_fetch = 100000

    def find(self, query, try_count=0):
        query.limit(self.TAB_LIMIT)
        if try_count >= self.try_times:
            return None
        try:
            return query.find()
        except:
            self.find(query, try_count + 1)

    def find_all(self, query):
        all_record_list = []
        created_less_than = datetime.datetime.now() + datetime.timedelta(days=1)
        for i in range(self.max_fetch / self.TAB_LIMIT):
            query.less_than('createdAt', created_less_than)
            query.descending('createdAt')
            record_list = self.find(query)
            print 'tab find_all: get %s.' % len(record_list)
            all_record_list += record_list
            if len(record_list) >= self.TAB_LIMIT:
                created_less_than = record_list[-1].created_at
            else:
                break
        return all_record_list

    def tab_obj2dict(self, obj):
        d = dict()
        for key in obj.attributes:
            d[key] = obj.attributes.get(key, None)
        d['created_at'] = obj.created_at
        d['updated_at'] = obj.updated_at
        d['id'] = obj.id
        return d

    def merged_save(self, records, class_name=None):
        if len(records) == 0:
            return
        class_name = class_name
        print 'merged_save: %s' % json.dumps(records, indent=4)
        resp = requests.post(self.HOST + '/service/SaveRecordsWithMerge', data=dict(
            class_name=class_name,
            record_list=json.dumps(records)
        ))
        print resp.text
        return resp.text

    def upload_graph(self, name, graph_type, data):
        resp = requests.post(self.HOST + '/service/plotNetGraphUpload/', data=dict(
            name=name,
            graph_type=graph_type,
            data=json.dumps(data)
        ))
        print resp.text
        return resp


class JSONEncoderWithTime(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            return obj.strftime('%Y-%m-%d %H:%M:%S.%f')
        # Let the base class default method raise the TypeError
        return json.JSONEncoder.default(self, obj)


TAB_UTIL = TabUtil()


if __name__ == "__main__":
    t = TabUtil()
    table = 'View'
    query = leancloud.Query(table)
    records = t.find_all(query)
    record_list = [t.tab_obj2dict(record) for record in records]
    with open(table+'.txt', 'wb') as fp:
        json.dump(record_list, fp, cls=JSONEncoderWithTime, indent=4)

