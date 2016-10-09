# -*- coding: UTF-8 -*-

import leancloud
import datetime

from leancloud import Object
from leancloud import Query


class TabUtil(object):
    TAB_LIMIT = 1000

    def __init__(self):
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

TAB_UTIL = TabUtil()

if __name__ == "__main__":
    t = TabUtil()
    query = leancloud.Query('StatusMap')
    query.equal_to('product', 'com.tencent.mobileqq')
    records = t.find_all(query)
    print len(records)
