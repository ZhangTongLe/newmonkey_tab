# -*- coding: UTF-8 -*-

import leancloud
import os
import pickle

from tab.tab_util import TAB_UTIL
from k_util import file_op


class MonkeyTab(object):
    def __init__(self):
        self.status_map_store_dir = '/data/newmonkey/app_simulator/'

    def get_status_map_from_tab(self, product, version):
        query = leancloud.Query('StatusMap')
        query.equal_to('product', product)
        query.equal_to('version', version)
        record_list = TAB_UTIL.find_all(query)
        record_list = map(lambda x: TAB_UTIL.tab_obj2dict(x), record_list)
        return record_list

    def get_status_map(self, product, version, load_from_file_first=True, do_save=True, do_reload=False):
        def save_to_file(record_list):
            file_path = os.path.join(self.status_map_store_dir, '%s__%s.pickle' % (product, version))
            file_op.make_sure_file_dir_exists(file_path)
            with open(file_path, 'wb') as fp:
                pickle.dump(record_list, fp)

        if load_from_file_first and not do_reload:
            file_path = os.path.join(self.status_map_store_dir, '%s__%s.pickle' % (product, version))
            if os.path.exists(file_path):
                print 'get_status_map: load from: %s' % file_path
                with open(file_path, 'rb') as fp:
                    record_list = pickle.load(fp)
            else:
                record_list = self.get_status_map_from_tab(product, version)
                if do_save:
                    save_to_file(record_list)
        else:
            record_list = self.get_status_map_from_tab(product, version)
            if do_save:
                save_to_file(record_list)
        return record_list

