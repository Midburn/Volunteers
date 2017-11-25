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
        '_id': departmentId,
        'nameEn': req.body.nameEn,
        'nameHe': req.body.nameHe,
        'websiteURL': req.body.websiteURL,
        'facebookPageUrl': req.body.facebookPageUrl,
        'twitterPageUrl': req.body.twitterPageUrl,
        'imageUrl': req.body.imageUrl,
        'deleted': req.body.deleted || false,
        'tags': req.body.tags || []
    });

    yield department.save();

    const departments = yield Department.find({deleted: false});
    return res.json(departments);
}));

router.put('/departments/:departmentId', co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;

    const updatedDepartment = {
        'nameEn': req.body.nameEn,
        'nameHe': req.body.nameHe,
        'websiteURL': req.body.websiteURL,
        'facebookPageUrl': req.body.facebookPageUrl,
        'twitterPageUrl': req.body.twitterPageUrl,
        'imageUrl': req.body.imageUrl,
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

    const departments = yield Department.find({deleted: false});
    return res.json(departments);
}));

//TODO - IMPLEMENT
router.get('/departments/me', co.wrap(function* (req, res) {
    return res.status(500).json({error: 'Not Implemented'})

}));


router.get('/departments/:departmentId/volunteers', co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;

    const department = yield Department.findOne({_id: departmentId, deleted: false});

    if (_.isEmpty(department)) return res.status(404).json({error: `Department ${departmentId} does not exist`});

    const departmentVolunteers = yield Volunteer.find({departmentId: departmentId, deleted: false});

    return res.json(departmentVolunteers);
}));

//POST MULTIPLE VOLUNTEERINGS - CREATE
router.post('/departments/:departmentId/volunteers/', co.wrap(function* (req, res) {
     // check if department exists
    const departmentId = req.params.departmentId;
    const department = yield Department.findOne({_id: departmentId, deleted: false});

    if (_.isEmpty(department)) return res.status(404).json({error: `Department ${departmentId} does not exist`});

    // filter user ids to new ones only (and return if there were no new ones left
    let requestUserIds = req.body.userIds || [];
    const existingVolunteers = yield Volunteer.find({
        departmentId: departmentId,
        deleted: false,
        userId: requestUserIds
    });

    let newVolunteerIds = requestUserIds.filter(function (newVolunteerUserId) {
        return existingVolunteers.filter(function (existing) {
            return existing.userId === newVolunteerUserId;
        }).length === 0;
    });

    if (newVolunteerIds.length === 0) {
        return res.json([]);
    }

    let tags = req.body.tags || [];
    let isDeleted = req.body.deleted || false;
    let roleId = req.body.roleId;
    let production = req.body.isProduction;
    let modifiedDate = req.body.modifiedDate;
    let eventId = req.body.eventId;
    // create an array of new volunteer documents for bulk saving
    let newVolunteers = [];
    newVolunteerIds.forEach(function (userId) {
        const volunteerId = uuid();
        const volunteer = new Volunteer({
            '_id': volunteerId,
            'userId': userId,
            'departmentId': departmentId,
            'roleId': roleId,
            'isProduction': production,
            'modifiedDate': modifiedDate,
            'eventId': eventId,
            'deleted': isDeleted,
            'tags': tags,
        });
        newVolunteers.push(volunteer);
    });
    // mongoose bulk save
    Volunteer.insertMany(newVolunteers)
        .then((docs) => {
            return res.json(docs);
        }).catch((err) => {
        console.log(`Unexpected error happened ${err}`);
        return res.status(500).json({error: `Unexpected error occurred while saving ${newVolunteers.length} new volunteers to db`});
    });
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
