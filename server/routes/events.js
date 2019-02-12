const express = require('express');
const router = express.Router();
const co = require('co');
const consts = require('../utils/consts');
const JWT_KEY = process.env.JWT_KEY;

router.get('/public/events', co.wrap(function*(req, res) {
    const events = {
        events: consts.SUPPORTED_EVENTS,
        current: req.userDetails.eventId,
        default: consts.DEFAULT_EVENT_ID,
        canChange: !req.userDetails.anonymousAccess
    }
    res.json(events)
}));

router.post('/events/change', co.wrap(function*(req, res) {
    const new_event = req.body.event;
    if (!consts.SUPPORTED_EVENTS.includes(new_event)){
        res.status(404).json({error: `Event ${new_event} does not exist`});
        return
    }
    
    if (new_event == req.userDetails.eventId) {
        res.json('OK')
        return
    }
    const cookie = req.cookies[JWT_KEY]
    cookie.currentEventId = new_event
    const options = process.env.LOCAL_SPARK === 'true' ? { httpOnly: true } : { httpOnly: true, domain: '.midburn.org' }
    res.cookie(JWT_KEY, cookie, options).json(cookie)
}));

module.exports = router;