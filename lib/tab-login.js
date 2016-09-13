/**
 * Created by kangtian on 16/9/11.
 */

var AV = require('leanengine');


AV.init({
    appId: process.env.LEANCLOUD_APP_ID,
    appKey: process.env.LEANCLOUD_APP_KEY,
    masterKey: process.env.LEANCLOUD_APP_MASTER_KEY
});

module.exports = AV;

