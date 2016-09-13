/**
 * Created by kangtian on 16/9/11.
 */

var AV = require('leanengine');


console.log(process.env.LEANCLOUD_APP_ID);

AV.init({
    appId: process.env.LEANCLOUD_APP_ID,
    appKey: process.env.LEANCLOUD_APP_KEY,
    masterKey: process.env.LEANCLOUD_APP_MASTER_KEY
});

module.exports = AV;
