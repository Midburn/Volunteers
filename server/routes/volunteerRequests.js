const express = require("express");
const router = express.Router();
const VolunteerRequest = require("../models/volunteerRequest");
const DepartmentFormsAnswer = require("../models/departmentFormsAnswers");
const co = require("co");
const _ = require('lodash');
const permissionsUtils = require('../utils/permissions');


// PUBLIC - Returns if the user has request in this department
router.get("/departments/:departmentId/events/:eventId/hasRequest", co.wrap(function* (req, res) {
    if (!req.headers.userdata) {
        return res.status(400).json({error: "invalid request"});
    }
    const userdata = JSON.parse(req.headers.userdata);
    const userId = userdata.profileEmail;
    const departmentId = req.params.departmentId;
    const eventId = req.params.eventId;
    const request = yield VolunteerRequest.findOne({
        departmentId,
        userId,
        eventId
    });
    return res.json({hasRequest: !!request});
}));

// Returns my requests
router.get("/volunteer-requests", co.wrap(function* (req, res) {
    const email = req.userDetails.email;
    const volunteerRequests = yield VolunteerRequest.find({userId: email});
    return res.json(volunteerRequests);
}));

// Get all join requests of a department 
router.get("/departments/:departmentId/events/:eventId/requests", co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;
    const eventId = req.params.eventId;

    if (!permissionsUtils.isDepartmentManager(req.userDetails, departmentId)) {
        return res.status(403).json([{"error": "Action is not allowed - User doesn't have manager permissions for department " + departmentId}]);
    }

    // TODO: permissions

    const volunteerRequests = yield VolunteerRequest.find({
        departmentId: departmentId,
        eventId: eventId
    });

    return res.json(volunteerRequests);
}));

// PUBLIC - Creates a new join requst
router.post("/departments/:departmentId/events/:eventId/join", co.wrap(function* (req, res) {
    if (!req.headers.userdata) {
        return res.status(400).json({error: "invalid request"});
    }
    const userdata = JSON.parse(req.headers.userdata);
    const userId = userdata.profileEmail;
    const departmentId = req.params.departmentId;
    const eventId = req.params.eventId;

    const volunteerRequest = new VolunteerRequest({
        departmentId,
        userId,
        eventId,
        contactEmail: userdata.contactEmail,
        contactPhone: userdata.contactPhoneNumber,
        approved: false
    });

    yield volunteerRequest.save();
    return res.json(volunteerRequest);
}));

// A new join request
router.put("/departments/:departmentId/events/:eventId/join", co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;
    const eventId = req.params.eventId;
    const approved = req.body.approved;
    const comment = req.body.comment;
    const email = req.userDetails.email;

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
    const email = req.userDetails.email;

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