const express = require("express");
const router = express.Router();
const Volunteer = require("../models/volunteer");
const Department = require('../models/deparment');
const co = require("co");
const _ = require('lodash');
const uuid = require('uuid/v1');
const permissionsUtils = require('../utils/permissions');

// Get all volunteers for department
router.get('/departments/:departmentId/volunteers', co.wrap(function* (req, res) {
  const departmentId = req.params.departmentId;

    if (!permissionsUtils.isDepartmentManager(req.userDetails, departmentId)) {
        return res.status(403).json([{"error": "Action is not allowed - User doesn't have manager permissions for department " + departmentId}]);
    }

    const department = yield Department.findOne({_id: departmentId, deleted: false});
  if (_.isEmpty(department)) return res.status(404).json({error: `Department ${departmentId} does not exist`});

  // TODO: check permission
  
  const departmentVolunteers = yield Volunteer.find({departmentId: departmentId, deleted: false});

  // TODO: get more info like name and phone number from spark

  return res.json(departmentVolunteers);
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
    const emails = req.body.emails
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];

      // existing volunteer
      const existingVolunteer = yield Volunteer.findOne({
          departmentId: departmentId,
          deleted: false,
          userId: email
      });
      if (existingVolunteer) {
        responses.push({email: email, status:'Already Exists'});
        continue;
      }

      // TODO: check valid profile against spark

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
      responses.push({email: email, status:'OK'});
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

  // TODO: check permission

  volunteer.deleted = true;
  yield volunteer.save();
  return res.json({status: "done"});
}));

module.exports = router;