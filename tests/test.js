/**
 * Created by kangtian on 16/9/11.
 */

var AV = require('../lib/tab-login');


var TestObject = AV.Object.extend('TestObject');
var testObject = new TestObject();
testObject.save({
    words: 'Hello World!'
}).then(function(object) {
    console.log('LeanCloud Rocks!');
});

