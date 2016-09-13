/**
 * Created by kangtian on 16/9/14.
 */


function chain_call(func, args_list) {
    // func must have a callback.
    // func(args, callback, i);
    var stack_list = [];
    var stack = {
        args: undefined,
        func: undefined,
        callback: undefined
    };
    for (var i = 0; i < args_list.length; i ++){
        var new_stack = JSON.parse(JSON.stringify(stack));
        new_stack.args = args_list[i];
        new_stack.callback = function (i) {
            i += 1;
            if (i >= stack_list.length)
                return;
            var this_stack = stack_list[i];
            this_stack.func(this_stack.args, this_stack.callback, i);
        };
        new_stack.func = func;
        stack_list.push(new_stack);
    }
    stack = stack_list[0];
    stack.func(stack.args, stack.callback, 0);
}
