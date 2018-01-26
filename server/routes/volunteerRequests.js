const express = require("express");
const router = express.Router();
const Volunteer = require("../models/volunteer");
const VolunteerRequest = require("../models/volunteerRequest");
const DepartmentFormsAnswer = require("../models/departmentFormsAnswers");
const co = require("co");
const _ = require('lodash');
const permissionsUtils = require('../utils/permissions');
const sparkApi = require('../spark/sparkApi');
const consts = require('../utils/consts');
const utils = require('../utils/utils');

const enrichRequestDetailsFromSpark = co.wrap(function* (requests) {
    const sparkInfos = yield requests.map(request => sparkApi.getProfileByMail([request.userId], 15 * 1000))
    for (let i=0; i<requests.length; i++) {
        const request = requests[i];
        const sparkInfo = sparkInfos[i] && sparkInfos[i][request.userId] ? sparkInfos[i][request.userId] : null;
        if (!sparkInfo) {
            request._doc.validProfile = false;
        } else {
            request._doc.validProfile = true;
            request._doc.firstName = sparkInfo['first_name'];
            request._doc.lastName = sparkInfo['last_name'];
            request._doc.hasTicket = sparkInfo['has_ticket'];
            request._doc.phone = sparkInfo['phone'];
        }
    };
    return requests;
});

const enrichRequestDetailsFromGeneralForm = co.wrap(function* (requests) {
    const generalForms = yield requests.map(request => DepartmentFormsAnswer.findOne({
        departmentId: consts.GENERAL_FORM,
        userId: request.userId,
        eventId: request.eventId
    }));
    for (let i=0; i<requests.length; i++) {
        const request = requests[i];
        const form = generalForms[i];
        if (!form) {
            request._doc.needToFillGeneralForm = !form;
        } else {
            // HACK - This is a hack to catch users that filled the old form - without the 18+ question
            const newForm = utils.isNewGeneralForm(form)
            request._doc.needToRefillGeneralForm = !newForm;
            request._doc.generalForm = form;
        }
    };

    return requests;
});

const enrichRequestDetailsFromDepartmentForm = co.wrap(function* (requests) {
    const departmentForms = yield requests.map(request => DepartmentFormsAnswer.findOne({
        departmentId: request.departmentId,
        userId: request.userId,
        eventId: request.eventId
    }));
    for (let i=0; i<requests.length; i++) {
        const request = requests[i];
        const form = departmentForms[i];
        if (form) {
            request._doc.departmentForm = form;
        }
    };

    return requests;
});


// PUBLIC - Returns if the user has request in this department
router.get("/public/departments/:departmentId/events/:eventId/hasRequest", co.wrap(function* (req, res) {
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

// MANAGER - Get all join requests of a department 
router.get("/departments/:departmentId/events/:eventId/requests", co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;
    const eventId = req.params.eventId;
    if (!permissionsUtils.isDepartmentManager(req.userDetails, departmentId)) {
        return res.status(403).json([{"error": "Action is not allowed - User doesn't have manager permissions for department " + departmentId}]);
    }

    let volunteerRequests = yield VolunteerRequest.find({
        departmentId: departmentId,
        eventId: eventId
    });
    volunteerRequests = yield enrichRequestDetailsFromSpark(volunteerRequests)
    volunteerRequests = yield enrichRequestDetailsFromGeneralForm(volunteerRequests)
    volunteerRequests = yield enrichRequestDetailsFromDepartmentForm(volunteerRequests)
    return res.json(volunteerRequests);
}));

// PUBLIC - Creates a new join requst
router.post("/public/departments/:departmentId/events/:eventId/join", co.wrap(function* (req, res) {
    if (!req.headers.userdata) {
        return res.status(400).json({error: "invalid request"});
    }
    const userdata = JSON.parse(req.headers.userdata);
    const userId = userdata.profileEmail;
    const departmentId = req.params.departmentId;
    const eventId = req.params.eventId;

    // if already request exists - update
    const request = yield VolunteerRequest.findOne({
        userId: userId,
        eventId: eventId,
        departmentId: departmentId
    })
    if (request) {
        request.contactEmail = userdata.contactEmail;
        request.contactPhone = userdata.contactPhoneNumber;
        yield request.save();
        return res.json(request);
    }
    
    // if already volunteer exists - update
    const volunteer = yield Volunteer.findOne({
        userId: userId,
        eventId: eventId,
        departmentId: departmentId,
        deleted: false
    })
    if (volunteer) {
        volunteer.contactEmail = userdata.contactEmail;
        volunteer.contactPhone = userdata.contactPhoneNumber;
        yield volunteer.save();
        return res.json(volunteer);
    }
    
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
router.put("/public/departments/:departmentId/events/:eventId/join", co.wrap(function* (req, res) {
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

// Edit volunteer
router.put("/departments/:departmentId/events/:eventId/requests/:userId", co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;
    const eventId = req.params.eventId;
    const userId = req.params.userId;
    const tags= req.body.tags;

    if (!permissionsUtils.isDepartmentManager(req.userDetails, departmentId)) {
        return res.status(403).json([{"error": "Action is not allowed - User doesn't have manager permissions for department " + departmentId}]);
    }

    const volunteerRequest = yield VolunteerRequest.findOne({
        userId: userId,
        eventId: eventId,
        departmentId: departmentId
    });

    volunteerRequest.tags = tags;

    yield volunteerRequest.save();

    return res.json(volunteerRequest);
}));

// MANAGER - Removes a request and the relvant department form
router.delete("/departments/:departmentId/events/:eventId/request/:userId", co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;
    const eventId = req.params.eventId;
    const userId = req.params.userId;
    if (!permissionsUtils.isDepartmentManager(req.userDetails, departmentId)) {
        return res.status(403).json([{"error": "Action is not allowed - User doesn't have manager permissions for department " + departmentId}]);
    }

    yield VolunteerRequest.findOneAndRemove({
        userId: userId,
        eventId: eventId,
        departmentId: departmentId
    });

    // if it's the only entry than remove the department form as well
    const request = yield VolunteerRequest.findOne({
        userId: userId,
        eventId: eventId,
        departmentId: departmentId
    })
    const volunteer = yield Volunteer.findOne({
        userId: userId,
        eventId: eventId,
        departmentId: departmentId,
        deleted: false
    })
    if (!request && !volunteer) {
        yield DepartmentFormsAnswer.findOneAndRemove({
            userId: userId,
            eventId: eventId,
            departmentId: departmentId
        })
    }
    return res.json({});
}));

module.exports = router;