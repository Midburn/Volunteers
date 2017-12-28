const express = require('express');
const router = express.Router();
const Department = require('../models/deparment');
const Volunteer = require('../models/volunteer');

const co = require('co');
const _ = require('lodash');
const uuid = require('uuid/v1');

router.get('/departments', co.wrap(function* (req, res) {
    const departments = yield Department.find({deleted: false});
    return res.json(departments);
}));

router.get('/departments/:departmentId', co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;

    const department = yield Department.find({_id: departmentId, deleted: false});
    return res.json(department);
}));

router.post('/departments', co.wrap(function* (req, res) {
    const departmentId = uuid();
    const department = new Department({
        ...req.body,
        '_id': departmentId,
        'deleted': false
    });
    yield department.save();
    return res.json(department);
}));

router.put('/departments/:departmentId', co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;
    const department = yield Department.findOne({_id: departmentId, deleted: false});
    if (_.isEmpty(department)) return res.status(404).json({error: `Department ${departmentId} does not exist`});

    const updatedDepartment = req.body;
    for (const key in updatedDepartment) {
        if (updatedDepartment.hasOwnProperty(key)) department[key] = updatedDepartment[key];
    }
    yield department.save();

    return res.json(department);
}));

router.delete('/departments/:departmentId', co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;
    const department = yield Department.findOne({_id: departmentId, deleted: false});
    if (_.isEmpty(department)) return res.status(404).json({error: `Department ${departmentId} does not exist`});

    department.deleted = true;
    yield department.save();
    return res.json({status: "done"});
}));

module.exports = router;
