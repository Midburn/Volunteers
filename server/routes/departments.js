const express = require('express');
const router = express.Router();
const Department = require('../models/deparment');
const permissionsUtils = require('../utils/permissions');

const co = require('co');
const _ = require('lodash');
const uuid = require('uuid/v1');

router.get('/public/departments', co.wrap(function* (req, res) {
    const departments = yield Department.find({
        deleted: false,
        eventId: req.userDetails.eventId
    });

    // TODO: (may) remove more secure data
    // (maybe take only the needed fields and not return all of them..)
    departments.forEach(department => {
        if (!permissionsUtils.isDepartmentManager(req.userDetails, department._id)) {
            delete department._doc.allocationsDetails;
        }
    });

    return res.json(departments);
}));

router.get('/departments/:departmentId', co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;

    // TODO: (may) remove more secure data if not being called by a manager or admin
    // (maybe take only the needed fields and not return all of them..)
    const department = yield Department.find({
        _id: departmentId, 
        deleted: false,
        eventId: req.userDetails.eventId
    });
    return res.json(department);
}));

router.post('/departments', co.wrap(function* (req, res) {
    if (!permissionsUtils.isAdmin(req.userDetails)) {
        return res.status(403).json([{"error": "Action is not allowed - User doesn't have admin permissions"}]);
    }

    const departmentId = uuid();
    const department = new Department({
        ...req.body,
        '_id': departmentId,
        eventId: req.userDetails.eventId,
        'deleted': false
    });
    yield department.save();
    return res.json(department);
}));

router.put('/departments/:departmentId', co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;
    const isAdminUser = permissionsUtils.isAdmin(req.userDetails);
    if (!permissionsUtils.isDepartmentManager(req.userDetails, departmentId)) {
        return res.status(403).json([{"error": "Action is not allowed - User doesn't have manager permissions for department " + departmentId}]);
    }

    const department = yield Department.findOne({
        _id: departmentId, 
        deleted: false,
        eventId: req.userDetails.eventId
    });
    if (_.isEmpty(department)) return res.status(404).json({error: `Department ${departmentId} does not exist`});

    const updatedDepartment = req.body;
    for (const key in updatedDepartment) {
        if (updatedDepartment.hasOwnProperty(key)) {
            if ((isAdminUser && key === 'allocationsDetails') ||
                (key !== 'allocationsDetails')) {
                department[key] = updatedDepartment[key];
            }
        }
    }
    yield department.save();

    return res.json(department);
}));

router.delete('/departments/:departmentId', co.wrap(function* (req, res) {
    if (!permissionsUtils.isAdmin(req.userDetails)) {
        return res.status(403).json([{"error": "Action is not allowed - User doesn't have admin permissions"}]);
    }

    // TODO: (may) should we also delete all the data of the department? like forms, volunteers, etc.
    // or at least mark it as deleted
    const departmentId = req.params.departmentId;
    const department = yield Department.findOne({
        _id: departmentId, 
        deleted: false,
        eventId: req.userDetails.eventId
    });
    if (_.isEmpty(department)) return res.status(404).json({error: `Department ${departmentId} does not exist`});

    department.deleted = true;
    yield department.save();
    return res.json({status: "done"});
}));

module.exports = router;
