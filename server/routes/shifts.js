const express = require('express');
const router = express.Router();
const Shift = require('../models/shift');
const permissionsUtils = require('../utils/permissions');
const co = require('co');
const _ = require('lodash');

router.get('/departments/:departmentId/events/:eventId/shifts', co.wrap(function*(req, res) {
  const departmentId = req.params.departmentId;
  const eventId = req.params.eventId;

  if (!permissionsUtils.isDepartmentManager(req.userDetails, departmentId)) {
    return res.status(403).json([{"error": "Action is not allowed - User doesn't have manager permissions for department " + departmentId}]);
  }

  const shifts = yield Shift.find({
    departmentId,
    eventId
  });
  return res.json(shifts);
}));

router.post('/departments/:departmentId/events/:eventId/shifts/:shiftId', co.wrap(function*(req, res) {
  const departmentId = req.params.departmentId;
  const eventId = req.params.eventId; 
  const shiftId = req.params.shiftId;

  if (!permissionsUtils.isDepartmentManager(req.userDetails, departmentId)) {
    return res.status(403).json([{"error": "Action is not allowed - User doesn't have manager permissions for department " + departmentId}]);
  }
  
  const shift = new Shift({
    '_id': shiftId,
    'title': req.body.title,
    'comment': req.body.comment,
    'color': req.body.color,
    'departmentId': departmentId,
    'eventId': eventId,
    'startDate': req.body.startDate,
    'endDate': req.body.endDate,
    'volunteers': req.body.volunteers,
    'reported': req.body.reported || []
  });

  yield shift.save();

  return res.json(shift);
}));

router.put('/departments/:departmentId/events/:eventId/shifts/:shiftId', co.wrap(function*(req, res) {
  const departmentId = req.params.departmentId;
  const eventId = req.params.eventId; 
  const shiftId = req.params.shiftId;

  if (!permissionsUtils.isDepartmentManager(req.userDetails, departmentId)) {
    return res.status(403).json([{"error": "Action is not allowed - User doesn't have manager permissions for department " + departmentId}]);
  }

  const updatedShift = {
    'title': req.body.title,
    'comment': req.body.comment,
    'color': req.body.color,
    'startDate': req.body.startDate,
    'endDate': req.body.endDate,
    'volunteers': req.body.volunteers,
    'reported': req.body.reported || []
  };

  const shift = yield Shift.findOne({
    _id: shiftId, 
    departmentId: departmentId,
    eventId: eventId

  });

  if (_.isEmpty(shift)) return res.status(400).json({error: `Shift ${shiftId} is not exists`});

  for (const key in updatedShift) {
    shift[key] = updatedShift[key] || shift[key];
  }

  yield shift.save();
  return res.json(shift);
}));

router.delete('/departments/:departmentId/events/:eventId/shifts/:shiftId', co.wrap(function*(req, res) {
  const departmentId = req.params.departmentId;
  const eventId = req.params.eventId; 
  const shiftId = req.params.shiftId;

  if (!permissionsUtils.isDepartmentManager(req.userDetails, departmentId)) {
    return res.status(403).json([{"error": "Action is not allowed - User doesn't have manager permissions for department " + departmentId}]);
  }

  const shift = yield Shift.findOne({
    _id: shiftId, 
    departmentId: departmentId,
    eventId: eventId

  });

  if (_.isEmpty(shift)) return res.status(400).json({error: `Shift ${shiftId} is not exists`});

  yield shift.remove();
  return res.json(shift);
}));

// router.get('/departments/:departmentId/shifts/me', co.wrap(function*(req, res) {
//   const departmentId = req.params.departmentId;
//   const email = req.userDetails.email;

//   try {
//     const departmentVolunteers = yield sparkFacade.volunteersByDepartment(req.token, departmentId);
//     const volunteer = departmentVolunteers.find(volunteer => volunteer.email === email);

//     if (!volunteer) {
//       return res.status(404).json({error: 'Not exists'})
//     }

//     const profileId = volunteer.profile_id;
//     const departmentShifts = yield Shift.find({departmentId: departmentId});
//     const volunteerShifts = departmentShifts.filter(shift => shift.volunteers[profileId] != null);

//     return res.json(volunteerShifts.map(shift => _.pick(shift, ['_id', 'title', 'color', 'startDate', 'endDate', 'comment'])));
//   }
//   catch (err) {
//     console.log(err);
//     return res.status(500).json({error: 'Internal error'})
//   }

// }));

module.exports = router;
