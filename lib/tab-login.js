/**
 * Created by kangtian on 16/9/11.
 */

var AV = require('leanengine');

var APP_ID = '2OqGTb47B0cChAg4xyOsP5D8-9Nh9j0Va';
var APP_KEY = '7sOFzdMRP1D0m6r9y5LE8aPy';
AV.init({
    appId: APP_ID,
    appKey: APP_KEY
});

module.exports = AV;