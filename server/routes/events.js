const express = require('express');
const router = express.Router();
const co = require('co');
const JWT_KEY = process.env.JWT_KEY;

router.get('/public/events', co.wrap(function*(req, res) {
    const events = {
        events: process.env.SUPPORTED_EVENTS.split('|'),
        current: req.userDetails.eventId,
        canChange: !req.userDetails.anonymousAccess
    }
    res.json(events)
}));

router.post('/events/change', co.wrap(function*(req, res) {
    const new_event = req.body.event;
    if (!process.env.SUPPORTED_EVENTS.split('|').includes(new_event)){
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