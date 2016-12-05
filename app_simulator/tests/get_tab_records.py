# -*- coding: UTF-8 -*-

import sys
reload(sys)
sys.setdefaultencoding('utf8')
import leancloud
import json
import csv
from tab.tab_util import TabUtil, JSONEncoderWithTime


def get_tab_records(table):
    t = TabUtil()
    query = leancloud.Query(table)
    records = t.find_all(query)
    record_list = [t.tab_obj2dict(record) for record in records]

    with open(table+'.txt', 'wb') as fp:
        json.dump(record_list, fp, cls=JSONEncoderWithTime, indent=4)

    with open(table+'.csv', 'wb') as fp:
        w = csv.DictWriter(fp, record_list[0].keys())
        w.writeheader()
        w.writerows(record_list)

if __name__ == "__main__":
    get_tab_records('View')
