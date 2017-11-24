const express = require('express');
const router = express.Router();
const Department = require('../models/deparment');
const DepartmentVolunteers = require('../models/deparmentVolunteers');

const co = require('co');
const _ = require('lodash');
const SparkFacade = require('../spark/spark');
const SPARK_HOST = (process.env.LOCAL_SPARK != 'true') ? process.env.SPARK_HOST : 'http://localhost:3000';

const sparkFacade = new SparkFacade(SPARK_HOST);
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
        '_id': departmentId,
        'nameEn': req.body.nameEn,
        'nameHe': req.body.nameHe,
        'deleted': req.body.deleted | false,
        'tags': req.body.tags || []
    });

    yield department.save();

    return res.json(department);
}));

router.put('/departments/:departmentId', co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;

    const updatedDepartment = {
        'nameEn': req.body.nameEn,
        'nameHe': req.body.nameHe,
        'deleted': req.body.deleted,
        'tags': req.body.tags
    };

    const department = yield Department.findOne({_id: departmentId, deleted: false});

    if (_.isEmpty(department)) return res.status(404).json({error: `Department ${departmentId} does not exist`});

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

    return res.json(department);
}));

//TODO - IMPLEMENT
router.get('/departments/me', co.wrap(function* (req, res) {
    return res.status(500).json({error: 'Not Implemented'})

}));


router.get('/departments/:departmentId/volunteers', co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;

    const department = yield Department.findOne({_id: departmentId, deleted: false});

    if (_.isEmpty(department)) return res.status(404).json({error: `Department ${departmentId} does not exist`});

    const departmentVolunteers = yield DepartmentVolunteers.find({departmentId: departmentId, deleted: false})

    return res.json(departmentVolunteers);
}));

//POST MULTIPLE VOLUNTEERINGS - CREATE
router.post('/departments/:dId/volunteers/', co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;

    const department = yield Department.findOne({_id: departmentId, deleted: false});

    if (_.isEmpty(department)) return res.status(404).json({error: `Department ${departmentId} does not exist`});
    const departmentVolunteerId = uuid();
    const departmentVolunteer = new DepartmentVolunteers({
        '_id': departmentVolunteerId,
        'userId': req.body.userId,
        'departmentId': departmentVolunteerId,
        'roleId': req.body.roleId,
        'isProduction': req.body.isProduction,
        'modifiedDate': req.body.modifiedDate,
        'eventId': req.body.deleted | false,
        'tags': req.body.tags | [],
    });

    yield departmentVolunteer.save();

    return res.json(departmentVolunteer);
}));

//PUT SINGLE VOLUNTEERING - UPDATE
//TODO - implement

// router.put('/departments/:dId/volunteers/:uid',
//     handleSparkProxy(req =>
//         sparkFacade.updateVolunteer(req.token, req.params.dId, req.params.uid, _.pick(req.body, ['role_id', 'is_production']))));

//DELETE SINGLUE VOLUNTEERING - REMOVE
//TODO - implement

// router.delete('/departments/:dId/volunteers/:uid',
//     handleSparkProxy(req =>
//         sparkFacade.deleteVolunteer(req.token, req.params.dId, req.params.uid)));

//DELETE VOLUNTEERS CACHE
//TODO - implement
// router.delete('/cache/volunteers',
//     handleSparkProxy(req =>
//         sparkFacade.deleteVolunteersCache()));

module.exports = router;
