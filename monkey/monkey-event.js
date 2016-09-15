/**
 * Created by kangtian on 16/9/15.
 */


var EventType = {
    CLICK: 'click'
};

function get_event_identify(event_record) {
    var identify;
    var event_data = event_record.get('event_data');
    identify = event_record.get('event_name') + '__' + get_event_entity_identify(event_record) + '__' + event_record.get('pre_activity') + '__' + event_record.get('next_activity');
    return identify;
}


function get_event_entity(event_record) {
    var event_entity = event_record.get('event_data')['event_entity'];
    return event_entity == undefined ? {} : event_entity;
}


function get_event_entity_identify(event_record) {
    var identify;
    var event_data = event_record.get('event_data');
    if (event_data['event_name'] == EventType.CLICK){
        identify = event_data['event_entity']['identify'];
    } else {
        identify = '';
    }
    return identify;
}


var MonkeyEvent = {
    get_event_identify: get_event_identify,
    get_event_entity: get_event_entity,
    get_event_entity_identify: get_event_entity_identify
};


module.exports = MonkeyEvent;
