/**
 * Created by kangtian on 16/9/12.
 */

function resp_json(res, d) {
    res.contentType('json');
    res.send(JSON.stringify(d));
    res.end();
}


function get_request_body(req) {
    return Object.assign(req.query, req.body);
}


var HttpUtil = {
    resp_json: resp_json,
    get_request_body: get_request_body
};

module.exports = HttpUtil;