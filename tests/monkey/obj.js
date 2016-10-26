/**
 * Created by kangtian on 16/10/25.
 */

function Obj(name) {
    this.name = name;
    this.another_name = 'hehe';
}

Obj.prototype.get = function () {
    var self = this;
    function abc() {
        console.log(self.another_name);
    }
    abc();
};

var obj = new Obj('kangtian');
obj.get();