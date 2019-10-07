const express = require('express');
const router = express.Router();
const co = require('co');
const JWT_KEY = process.env.JWT_KEY;
const Round = require('../models/TicketsAllocByRound');
const uuid = require('uuid/v1');
const permissionsUtils = require('../utils/permissions');

router.get('/rounds', co.wrap(function* (req, res) {
    if (!permissionsUtils.isAdmin(req.userDetails)) {
        return res.status(403).json([{ "error": "Action is not allowed - User doesn't have admin permissions" }]);
    }

    const rounds = yield Round.find({});

    return res.json(rounds);
}));

router.get('/rounds/active', co.wrap(function* (req, res) {
    if (!permissionsUtils.isAdmin(req.userDetails)) {
        return res.status(403).json([{ "error": "Action is not allowed - User doesn't have admin permissions" }]);
    }

    const round = yield Round.findOne({ is_show: true });

    return res.json(round);
}));

router.post('/rounds/:eventId', co.wrap(function* (req, res) {
    // if (!permissionsUtils.isAdmin(req.userDetails)) {
    //     return res.status(403).json([{"error": "Action is not allowed - User doesn't have admin permissions"}]);
    // }

    const eventId = req.params.eventId;
    const round = new Round({
        eventId,
        startDate: req.startDate,
        endDate: req.endDate,
        based_event_id: req.based_event_id,
        is_show: req.is_show,
        description: req.description || ''
    });

    yield round.save();
    return res.json(round);
}));

// router.post('/events/change', co.wrap(function*(req, res) {
//     const new_event = req.body.event;
//     if (!consts.SUPPORTED_EVENTS.includes(new_event)){
//         res.status(404).json({error: `Event ${new_event} does not exist`});
//         return
//     }

//     if (new_event == req.userDetails.eventId) {
//         res.json('OK')
//         return
//     }
//     const cookie = req.cookies[JWT_KEY]
//     cookie.currentEventId = new_event
//     const options = process.env.LOCAL_SPARK === 'true' ? { httpOnly: true } : { httpOnly: true, domain: '.midburn.org' }
//     res.cookie(JWT_KEY, cookie, options).json(cookie)
// }));

module.exports = router;
