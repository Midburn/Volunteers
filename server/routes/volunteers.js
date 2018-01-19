const express = require("express");
const router = express.Router();
const Volunteer = require("../models/volunteer");
const Department = require('../models/deparment');
const co = require("co");
const _ = require('lodash');
const uuid = require('uuid/v1');
const sparkApi = require('../spark/sparkApi');
const permissionsUtils = require('../utils/permissions');

const enrichVolunteerOtherDepartments = co.wrap(function* (departmentId, departmentVolunteers) {
    const departmentVolunteersOtherDepartments = yield Volunteer
        .find({
            userId: {$in: departmentVolunteers.map(volunteer => volunteer.userId)},
            deleted: false
        });

    let otherDepartmentIds = departmentVolunteersOtherDepartments.map(volunteer => volunteer.departmentId);
    const otherDepartmentObjects = yield Department.find({_id: {$in: otherDepartmentIds}, deleted: false});
    let idToDepartment = {};
    otherDepartmentObjects.forEach(department => {
        idToDepartment[department._id] = department
    });

    departmentVolunteers.forEach(volunteer => {
        volunteer._doc.otherDepartments = departmentVolunteersOtherDepartments
            .filter(volunteerInOtherDepartments => (volunteerInOtherDepartments.userId === volunteer.userId
                && volunteerInOtherDepartments.departmentId !== departmentId))
            .map(volunteerInOtherDepartments => idToDepartment[volunteerInOtherDepartments.departmentId].basicInfo);
    });
});

const enrichVolunteerDetailsFromSpark = co.wrap(function* (volunteers) {
    const emails = volunteers.map(volunteer => volunteer.userId);
    const volunteerDetailsByEmail = yield sparkApi.getProfileByMail(emails);

    volunteers.forEach(volunteer => {
        const volunteerDetails = volunteerDetailsByEmail[volunteer.userId];
        if (!volunteerDetails) {
            volunteer._doc.validProfile = false;
        } else {
            volunteer._doc.validProfile = true;
            volunteer._doc.firstName = volunteerDetails['first_name'];
            volunteer._doc.lastName = volunteerDetails['last_name'];
            volunteer._doc.hasTicket = volunteerDetails['has_ticket'];
            volunteer._doc.phone = volunteerDetails['phone'];
        }
    });

    return volunteers;
});

const userExists = co.wrap(function* (email) {
    const volunteerDetails = yield sparkApi.getProfileByMail(email);

    return email in volunteerDetails;
});


// Get all volunteers for department
router.get('/departments/:departmentId/volunteers', co.wrap(function* (req, res) {
  const departmentId = req.params.departmentId;

    if (!permissionsUtils.isDepartmentManager(req.userDetails, departmentId)) {
        return res.status(403).json([{"error": "Action is not allowed - User doesn't have manager permissions for department " + departmentId}]);
    }

    const department = yield Department.findOne({_id: departmentId, deleted: false});
  if (_.isEmpty(department)) return res.status(404).json({error: `Department ${departmentId} does not exist`});

    const departmentVolunteers = yield Volunteer.find({departmentId: departmentId, deleted: false});
    if (departmentVolunteers) {
        yield enrichVolunteerOtherDepartments(departmentId, departmentVolunteers);
        yield enrichVolunteerDetailsFromSpark(departmentVolunteers);
    }

    return res.json(departmentVolunteers);
}));

// MANAGER - adds a new volunteer to the department
router.post('/departments/:departmentId/events/:eventId/volunteer', co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;
    const eventId = req.params.eventId;
    const userId = req.body.userId;
    if (!permissionsUtils.isDepartmentManager(req.userDetails, departmentId)) {
        return res.status(403).json([{"error": "Action is not allowed - User doesn't have manager permissions for department " + departmentId}]);
    }
    const department = yield Department.findOne({_id: departmentId, deleted: false});
    if (_.isEmpty(department)) return res.status(404).json({error: `Department ${departmentId} does not exist`});

    // invalid profile
    const volunteerDetailsByEmail = yield sparkApi.getProfileByMail([userId]);
    if (!(userId in volunteerDetailsByEmail)) {
        return res.status(404).json({error: 'Invalid Midburn Profile'})
    }

    // already volunteering
    const existingVolunteer = yield Volunteer.findOne({
        departmentId,
        userId,
        eventId,
        deleted: false,
    });
    if (existingVolunteer) {
        return res.status(404).json({error: 'Already volunteering'})
    }

    // add as volunteer
    const volunteerId = uuid();
    const volunteer = new Volunteer({
        _id: volunteerId,
        departmentId,
        eventId,
        userId,
        contactEmail: req.body.contactEmail,
        contactPhone: req.body.contactPhone,        
        permission: req.body.permission,
        yearly: req.body.yearly,
        deleted: false
    });
    yield volunteer.save();
    return res.json(volunteer);
}));

// Add multiple volunteers to department
router.post('/departments/:departmentId/volunteers/', co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;

    if (!permissionsUtils.isDepartmentManager(req.userDetails, departmentId)) {
        return res.status(403).json([{"error": "Action is not allowed - User doesn't have manager permissions for department " + departmentId}]);
    }

    const department = yield Department.findOne({_id: departmentId, deleted: false});
    if (_.isEmpty(department)) return res.status(404).json({error: `Department ${departmentId} does not exist`});

    // TODO: check permission

    const responses = [];
    const newVolunteers = [];
    const emails = req.body.emails;

    const volunteerDetailsByEmail = yield sparkApi.getProfileByMail(emails);

    for (let i = 0; i < emails.length; i++) {
        const email = emails[i];

        if (!(email in volunteerDetailsByEmail)) {
            responses.push({email: email, status: 'Failed'});
            continue;
        }

        // existing volunteer
        const existingVolunteer = yield Volunteer.findOne({
            departmentId: departmentId,
            deleted: false,
            userId: email
        });
        if (existingVolunteer) {
            responses.push({email: email, status: 'Already Exists'});
            continue;
        }

        // new volunteers
        const volunteerId = uuid();
        const volunteer = new Volunteer({
            _id: volunteerId,
            departmentId,
            userId: email,
            permission: req.body.permission,
            yearly: req.body.yearly,
            deleted: false
        });
        newVolunteers.push(volunteer);
        responses.push({email: email, status: 'OK'});
    }

    // mongoose bulk save
    yield Volunteer.insertMany(newVolunteers);
    return res.json(responses);
}));

// Update one volunteer in department
router.put('/departments/:departmentId/volunteer/:volunteerId', co.wrap(function* (req, res) {
  const departmentId = req.params.departmentId;

    if (!permissionsUtils.isDepartmentManager(req.userDetails, departmentId)) {
        return res.status(403).json([{"error": "Action is not allowed - User doesn't have manager permissions for department " + departmentId}]);
    }

    const volunteerId = req.params.volunteerId;
  const volunteer = yield Volunteer.findOne({_id: volunteerId, departmentId: departmentId, deleted: false});
  if (_.isEmpty(volunteer)) return res.status(404).json({error: `Volunteer ${volunteerId} does not exist`});
    // TODO: check permission

    const updatedVolunteer = req.body;
    for (const key in updatedVolunteer) {
        if (updatedVolunteer.hasOwnProperty(key)) volunteer[key] = updatedVolunteer[key];
    }
    yield volunteer.save();
    return res.json(volunteer);
}));

// Delete one volunteer in department
router.delete('/departments/:departmentId/volunteer/:volunteerId', co.wrap(function* (req, res) {
  const departmentId = req.params.departmentId;

    if (!permissionsUtils.isDepartmentManager(req.userDetails, departmentId)) {
        return res.status(403).json([{"error": "Action is not allowed - User doesn't have manager permissions for department " + departmentId}]);
    }

    const volunteerId = req.params.volunteerId;
  const volunteer = yield Volunteer.findOne({_id: volunteerId, departmentId: departmentId, deleted: false});
  if (_.isEmpty(volunteer)) return res.status(404).json({error: `Volunteer ${volunteerId} does not exist`});

    volunteer.deleted = true;
    yield volunteer.save();
    return res.json({status: "done"});
}));

module.exports = router;