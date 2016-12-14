# -*- coding: UTF-8 -*-

import leancloud
import json
import csv
import traceback

from tab.tab_util import TAB_UTIL


def upload_product_info():
    product_id_to_obj_id = {}
    config_to_product = {}

    productInfo = leancloud.Object.extend('ProductInfo')

    with open('/Users/kangtian/Downloads/products.json', 'rb') as fp:
        product_list = json.load(fp)

        for p in product_list:
            try:
                product = productInfo()
                product.set('product_name', p['productName'])
                product.set('package', p['packageName'])
                product.set('platform', p['platform_id'])
                product.set('workspace_id', p['tapdBugCommitWorkSpaceId'])
                product.set('who_update', p['whoUpdate'])
                product.set('department', p['department'])
                product.set('app_log_path', p['appLogPath'])
                product.save()
                product_id_to_obj_id[p['id']] = product.id
                print 'ok ~ %s' % product
            except:
                print "save product: %s\nproduct: %s" % (traceback.format_exc(), p)

    with open('/Users/kangtian/Downloads/monkey_product_task_config.json', 'rb') as fp:
        product_config_list = json.load(fp)
        for r in product_config_list:
            config_to_product[r['taskConfig_id']] = r['product_id']

    with open('/Users/kangtian/Downloads/monkey_task_config.csv', 'rb') as fp:
        csv_reader = csv.DictReader(fp, delimiter=',')
        config_list = list(csv_reader)    # ['MD5', 'DisplayName', 'Address', 'Size']
        taskConfig = leancloud.Object.extend('TaskConfig')
        for c in config_list:
            config_dict = json.loads(c['configJson'])
            if '' in config_dict:
                del config_dict['']
            config = taskConfig()
            product_id = config_to_product[int(c['id'])]
            product_tab_id = product_id_to_obj_id[product_id]
            config.set('product', productInfo.create_without_data(product_tab_id))
            config.set('task_name', c['taskName'])
            config.set('config', config_dict)
            config.set('who_update', c['whoUpdate'])
            config.save()
            print 'config ok ~ %s' % config


if __name__ == "__main__":
    upload_product_info()

