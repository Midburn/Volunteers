const express = require("express");
const router = express.Router();
const VolunteerRequest = require("../models/volunteerRequest");
const co = require("co");
const _ = require('lodash');

router.get("/volunteer-requests", co.wrap(function* (req, res) {
    const email = req.params.email;

    const volunteerRequests = yield VolunteerRequest.find({email: email});

    return res.json(volunteerRequests);
}));

router.get("/departments/:departmentId/events/:eventId/requests", co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;
    const eventId = req.params.eventId;

    const volunteerRequests = yield VolunteerRequest.find({
        departmentId: departmentId,
        eventId: eventId
    });

    return res.json(volunteerRequests);
}));

router.post("/departments/:departmentId/events/:eventId/requests", co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;
    const eventId = req.params.eventId;
    const email = req.body.email;
    const comment = req.body.comment;

    const volunteerRequest = new VolunteerRequest({
        departmentId: departmentId,
        eventId: eventId,
        userId: email,
        approved: false,
        comment: comment
    });

    yield volunteerRequest.save();

    return res.json(volunteerRequest);
}));

router.put("/departments/:departmentId/events/:eventId/requests", co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;
    const eventId = req.params.eventId;
    const email = req.body.email;
    const approved = req.body.approved;
    const comment = req.body.comment;

    const volunteerRequest = yield VolunteerRequest.findOne({
        userId: email,
        eventId: eventId,
        departmentId: departmentId
    });

    volunteerRequest.approved = approved;
    comment && (volunteerRequest.comment = comment);

    yield volunteerRequest.save();

    return res.json(volunteerRequest);
}));

router.delete("/departments/:departmentId/events/:eventId/requests", co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;
    const eventId = req.params.eventId;
    const email = req.body.email;

    const volunteerRequest = yield VolunteerRequest.findOne({
        userId: email,
        eventId: eventId,
        departmentId: departmentId
    });

    if (_.isEmpty(volunteerRequest)) return res.status(404).json({error: "Request not exists"});

    yield volunteerRequest.remove();

    return res.json(volunteerRequest);
}));

module.exports = router;