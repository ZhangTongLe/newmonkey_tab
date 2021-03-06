/**
 * Created by kangtian on 16/9/12.
 */


function resp_json(res, d) {
    res.contentType('json');
    res.send(JSON.stringify(d));
    res.end();
}


function get_request_body(req) {
    if (req.body && req.body.length > 0) {
        return req.body;
    }
    else {
        return req.query;
    }
}


var HttpUtil = {
    resp_json: resp_json,
    get_request_body: get_request_body
};

module.exports = HttpUtil;