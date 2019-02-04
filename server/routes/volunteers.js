const express = require("express");
const router = express.Router();
const Volunteer = require("../models/volunteer");
const VolunteerRequest = require("../models/volunteerRequest");
const Department = require('../models/deparment');
const DepartmentFormsAnswer = require('../models/departmentFormsAnswers');
const co = require("co");
const _ = require('lodash');
const uuid = require('uuid/v1');
const sparkApi = require('../spark/sparkApi');
const permissionsUtils = require('../utils/permissions');
const consts = require('../utils/consts');
const utils = require('../utils/utils');

const enrichVolunteerOtherDepartments = co.wrap(function* (departmentId, departmentVolunteers, eventId) {
    const departmentVolunteersOtherDepartments = yield Volunteer
        .find({
            userId: {$in: departmentVolunteers.map(volunteer => volunteer.userId)},
            eventId,
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
    const sparkInfos = yield volunteers.map(volunteer => sparkApi.getProfile(volunteer.userId))
    for (let i = 0; i < volunteers.length; i++) {
        const volunteer = volunteers[i];
        const sparkInfo = sparkInfos[i];
        if (!sparkInfo) {
            volunteer._doc.validProfile = false;
        } else {
            volunteer._doc.validProfile = true;
            volunteer._doc.firstName = sparkInfo['first_name'];
            volunteer._doc.lastName = sparkInfo['last_name'];
            volunteer._doc.hasTicket = sparkInfo['has_ticket'];
            volunteer._doc.numOfTickets = sparkInfo['num_of_tickets'];
            volunteer._doc.phone = sparkInfo['phone'];
        }
    }

    return volunteers;
});

const enrichVolunteerDetailsFromGeneralForm = co.wrap(function* (volunteers) {
    const generalForms = yield volunteers.map(volunteer => DepartmentFormsAnswer.findOne({
        departmentId: consts.GENERAL_FORM,
        userId: volunteer.userId,
        eventId: volunteer.eventId
    }));
    for (let i = 0; i < volunteers.length; i++) {
        const volunteer = volunteers[i];
        const form = generalForms[i];
        if (!form) {
            volunteer._doc.needToFillGeneralForm = !form;
        } else {
            volunteer._doc.generalForm = form;
            if (!volunteer._doc.sparkInfo) {
                volunteer._doc.sparkInfo = {};
            }
            if (!volunteer._doc.sparkInfo.firstName) {
                volunteer._doc.sparkInfo.firstName = utils.firstNameFromGeneralForm(form);
            }
            if (!volunteer._doc.sparkInfo.lastName) {
                volunteer._doc.sparkInfo.lastName = utils.lastNameFromGeneralForm(form);
            }
        }
    }
    ;

    return volunteers;
});


const enrichVolunteerDetailsFromDepartmentForm = co.wrap(function* (volunteers) {
    const departmentsForms = yield volunteers.map(volunteer => DepartmentFormsAnswer.findOne({
        departmentId: volunteer.departmentId,
        userId: volunteer.userId,
        eventId: volunteer.eventId
    }));
    for (let i = 0; i < volunteers.length; i++) {
        const volunteer = volunteers[i];
        const form = departmentsForms[i];
        if (form) {
            volunteer._doc.departmentForm = form;
        }
    }

    return volunteers;
});

const userExists = co.wrap(function* (email) {
    const volunteerDetails = yield sparkApi.getProfileByMail(email);

    return email in volunteerDetails;
});


const getDepartmentVolunteers = co.wrap(function* (departmentId) {
    return yield Volunteer.find({departmentId: departmentId, deleted: false});
});

const getDepartmentUpdatedAllocationDetails = co.wrap(function* (departmentId) {
    const departmentVolunteersMongoDocs = yield getDepartmentVolunteers(departmentId);
    const departmentVolunteersAllocationsDetails = departmentVolunteersMongoDocs.map(volunteer => volunteer._doc.allocationsDetails).filter(volunteerAllocationsDetails => volunteerAllocationsDetails !== null);
    const allocatedTicketsReducer = (currentValue, volunteerAllocationsDetails) => currentValue + (volunteerAllocationsDetails.allocatedTickets || 0);
    return {
        allocatedTickets: departmentVolunteersAllocationsDetails.reduce(allocatedTicketsReducer, 0),
        allocatedEarlyEntrancesPhase1: departmentVolunteersAllocationsDetails.filter(volunteerAllocationsDetails => volunteerAllocationsDetails.allocatedEarlyEntrancePhase1 === true).length,
        allocatedEarlyEntrancesPhase2: departmentVolunteersAllocationsDetails.filter(volunteerAllocationsDetails => volunteerAllocationsDetails.allocatedEarlyEntrancePhase2 === true).length,
        allocatedEarlyEntrancesPhase3: departmentVolunteersAllocationsDetails.filter(volunteerAllocationsDetails => volunteerAllocationsDetails.allocatedEarlyEntrancePhase3 === true).length
    };
});

const checkUpdatedVolunteerAllocationDetailsIsValid = co.wrap(function* (departmentId, currentVolunteerAllocationsDetails, updateVolunteerAllocationsDetails) {
    let errorMessage = null;
    let diffInDepartmentAllocatedTickets = 0;
    let diffInDepartmentAllocatedEarlyEntrancePhase1 = 0;
    let diffInDepartmentAllocatedEarlyEntrancePhase2 = 0;
    let diffInDepartmentAllocatedEarlyEntrancePhase3 = 0;
    if (updateVolunteerAllocationsDetails.allocatedTickets &&
        updateVolunteerAllocationsDetails.allocatedTickets !== currentVolunteerAllocationsDetails.allocatedTickets) {
        diffInDepartmentAllocatedTickets = (updateVolunteerAllocationsDetails.allocatedTickets - currentVolunteerAllocationsDetails.allocatedTickets);
    }
    if (updateVolunteerAllocationsDetails.allocatedEarlyEntrancePhase1 &&
        updateVolunteerAllocationsDetails.allocatedEarlyEntrancePhase1 !== currentVolunteerAllocationsDetails.allocatedEarlyEntrancePhase1) {
        diffInDepartmentAllocatedEarlyEntrancePhase1 = (updateVolunteerAllocationsDetails.allocatedEarlyEntrancePhase1 === true) ? 1 : -1;
    }
    if (updateVolunteerAllocationsDetails.allocatedEarlyEntrancePhase2 &&
        updateVolunteerAllocationsDetails.allocatedEarlyEntrancePhase2 !== currentVolunteerAllocationsDetails.allocatedEarlyEntrancePhase2) {
        diffInDepartmentAllocatedEarlyEntrancePhase2 = (updateVolunteerAllocationsDetails.allocatedEarlyEntrancePhase2 === true) ? 1 : -1;
    }
    if (updateVolunteerAllocationsDetails.allocatedEarlyEntrancePhase3 &&
        updateVolunteerAllocationsDetails.allocatedEarlyEntrancePhase3 !== currentVolunteerAllocationsDetails.allocatedEarlyEntrancePhase3) {
        diffInDepartmentAllocatedEarlyEntrancePhase3 = (updateVolunteerAllocationsDetails.allocatedEarlyEntrancePhase3 === true) ? 1 : -1;
    }

    const departmentUpdatedAllocationDetails = yield getDepartmentUpdatedAllocationDetails(departmentId);
    const department = yield Department.findOne({_id: departmentId, deleted: false});
    let allocatedEarlyEntrancesPhase1 = departmentUpdatedAllocationDetails.allocatedEarlyEntrancesPhase1;
    let allocatedEarlyEntrancesPhase2 = departmentUpdatedAllocationDetails.allocatedEarlyEntrancesPhase2;
    let allocatedEarlyEntrancesPhase3 = departmentUpdatedAllocationDetails.allocatedEarlyEntrancesPhase3;

    let allocatedTickets = departmentUpdatedAllocationDetails.allocatedTickets;
    let departmentMaxAllocatedEarlyEntrancesPhase1 = (department.allocationsDetails && department.allocationsDetails.maxAllocatedEarlyEntrancesPhase1) ? department.allocationsDetails.maxAllocatedEarlyEntrancesPhase1 : 0;
    let departmentMaxAllocatedEarlyEntrancesPhase2 = (department.allocationsDetails && department.allocationsDetails.maxAllocatedEarlyEntrancesPhase2) ? department.allocationsDetails.maxAllocatedEarlyEntrancesPhase2 : 0;
    let departmentMaxAllocatedEarlyEntrancesPhase3 = (department.allocationsDetails && department.allocationsDetails.maxAllocatedEarlyEntrancesPhase3) ? department.allocationsDetails.maxAllocatedEarlyEntrancesPhase3 : 0;

    let departmentMaxAllocatedTickets = (department.allocationsDetails && department.allocationsDetails.maxAllocatedTickets) ? department.allocationsDetails.maxAllocatedTickets : 0;
    if (departmentMaxAllocatedEarlyEntrancesPhase1 < allocatedEarlyEntrancesPhase1 + diffInDepartmentAllocatedEarlyEntrancePhase1) {
        errorMessage = `Couldn't allocate another early entrance on phase 1 for department ${department.basicInfo.nameEn} - only ${departmentMaxAllocatedEarlyEntrancesPhase1} early entrances allowed for department, while ${allocatedEarlyEntrancesPhase1} are already allocated`;
    } else if (departmentMaxAllocatedEarlyEntrancesPhase2 < allocatedEarlyEntrancesPhase2 + diffInDepartmentAllocatedEarlyEntrancePhase2) {
        errorMessage = `Couldn't allocate another early entrance on phase 2 for department ${department.basicInfo.nameEn} - only ${departmentMaxAllocatedEarlyEntrancesPhase2} early entrances allowed for department, while ${allocatedEarlyEntrancesPhase2} are already allocated`;
    } else if (departmentMaxAllocatedEarlyEntrancesPhase3 < allocatedEarlyEntrancesPhase3 + diffInDepartmentAllocatedEarlyEntrancePhase3) {
        errorMessage = `Couldn't allocate another early entrance on phase 3 for department ${department.basicInfo.nameEn} - only ${departmentMaxAllocatedEarlyEntrancesPhase3} early entrances allowed for department, while ${allocatedEarlyEntrancesPhase3} are already allocated`;
    } else if (departmentMaxAllocatedTickets < allocatedTickets + diffInDepartmentAllocatedTickets) {
        errorMessage = `Couldn't allocate another ${diffInDepartmentAllocatedTickets} extra tickets for department ${department.basicInfo.nameEn} - only ${departmentMaxAllocatedTickets} tickets allowed for department, while ${allocatedTickets} are already allocated`;
    }

    return errorMessage;
});

router.get('/public/volunteers/getEarlyEntrance', co.wrap(function* (req, res) {
    let token = req.headers.token;
    if (!token){
        return res.status(401).json({"error": "Token is empty"});
    }
    const sparkToken = sparkApi.getAuthHeader().token;
    if (token !== sparkToken){
        return res.status(401).json({"error": "Sent token is wrong!"});
    }
    const NO_EARLY_ENTRANCES = "no";
    const EARLY_ENTRANCES = {
        "no": {earlyEntranceDate: null},
        1: {
            earlyEntranceDate: "2018-05-05"
        },
        2: {
            earlyEntranceDate: "2018-05-13"
        },
        3: {earlyEntranceDate: "2018-05-14"}
    };

    const userEmail = req.query.userEmail;
    console.log(userEmail);
    if (!userEmail){
        return res.status(401).json({"error": "User email is empty"});
    }
    const eventId = req.userDetails.eventId;
    const volunteerInDepartments = yield Volunteer
        .find({
            userId: new RegExp(["^", userEmail, "$"].join(""), "i"),
            eventId,
            deleted: false
        });
    if (!volunteerInDepartments) {
        return res.json(EARLY_ENTRANCES[NO_EARLY_ENTRANCES]);
    } else {
        console.log("volunteerInDepartments="+JSON.stringify(volunteerInDepartments));
        let allocatedEarlyEntrancePhases = volunteerInDepartments.map(volunteer => {
            if (!volunteer.allocationsDetails) {
                return null;
            } else if (volunteer.allocationsDetails.allocatedEarlyEntrancePhase1 === true) {
                return 1;
            } else if (volunteer.allocationsDetails.allocatedEarlyEntrancePhase2 === true) {
                return 2;
            } else if (volunteer.allocationsDetails.allocatedEarlyEntrancePhase3 === true) {
                return 3;
            }
            return null;
        }).filter(phase => phase !== null);
        // if (allocatedEarlyEntrancePhases){
        //     return res.json(EARLY_ENTRANCES[NO_EARLY_ENTRANCES]);
        // }
        console.log("all phases='"+allocatedEarlyEntrancePhases+"'");
        let firstEarlyEntrancePhase = Math.min(...allocatedEarlyEntrancePhases);
        console.log("first phase="+firstEarlyEntrancePhase);
        if (firstEarlyEntrancePhase === null || firstEarlyEntrancePhase === Infinity) {
            return res.json(EARLY_ENTRANCES[NO_EARLY_ENTRANCES]);
        } else {
            return res.json(EARLY_ENTRANCES[firstEarlyEntrancePhase]);
        }
    }
}));

router.get('/departments/:departmentId/volunteersAllocations', co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;
    const eventId = req.userDetails.eventId;
    if (!permissionsUtils.isDepartmentManager(req.userDetails, departmentId)) {
        return res.status(403).json([{"error": "Action is not allowed - User doesn't have manager permissions for department " + departmentId}]);
    }

    const department = yield Department.findOne({_id: departmentId, eventId, deleted: false});
    if (_.isEmpty(department)) return res.status(404).json({error: `Department ${departmentId} does not exist`});

    const departmentUpdatedAllocationDetails = yield getDepartmentUpdatedAllocationDetails(departmentId);
    return res.json(departmentUpdatedAllocationDetails);
}));

// Get all volunteers for department
router.get('/departments/:departmentId/volunteers', co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;
    const eventId = req.userDetails.eventId;
    if (!permissionsUtils.isDepartmentManager(req.userDetails, departmentId)) {
        return res.status(403).json([{"error": "Action is not allowed - User doesn't have manager permissions for department " + departmentId}]);
    }

    const department = yield Department.findOne({_id: departmentId, eventId, deleted: false});
    if (_.isEmpty(department)) return res.status(404).json({error: `Department ${departmentId} does not exist`});
    console.time(`Get volunteers - ${department.basicInfo.nameEn} - full`);

    console.time(`Get volunteers - ${department.basicInfo.nameEn} - find`);
    const departmentVolunteers = yield getDepartmentVolunteers(departmentId);
    console.timeEnd(`Get volunteers - ${department.basicInfo.nameEn} - find`);
    if (departmentVolunteers) {
        console.time(`Get volunteers - ${department.basicInfo.nameEn} - enrich other departments`);
        yield enrichVolunteerOtherDepartments(departmentId, departmentVolunteers, eventId);
        console.timeEnd(`Get volunteers - ${department.basicInfo.nameEn} - enrich other departments`);

        console.time(`Get volunteers - ${department.basicInfo.nameEn} - enrich general form`);
        yield enrichVolunteerDetailsFromGeneralForm(departmentVolunteers);
        console.timeEnd(`Get volunteers - ${department.basicInfo.nameEn} - enrich general form`);

        console.time(`Get volunteers - ${department.basicInfo.nameEn} - enrich department form`);
        yield enrichVolunteerDetailsFromDepartmentForm(departmentVolunteers);
        console.timeEnd(`Get volunteers - ${department.basicInfo.nameEn} - enrich department form`);
    }

    console.timeEnd(`Get volunteers - ${department.basicInfo.nameEn} - full`);
    return res.json(departmentVolunteers);
}));

// MANAGER - adds a new volunteer to the department
router.post('/departments/:departmentId/volunteer', co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;
    const eventId = req.userDetails.eventId;
    const userId = req.body.userId;
    if (!permissionsUtils.isDepartmentManager(req.userDetails, departmentId)) {
        return res.status(403).json([{"error": "Action is not allowed - User doesn't have manager permissions for department " + departmentId}]);
    }
    const department = yield Department.findOne({_id: departmentId, eventId, deleted: false});
    if (_.isEmpty(department)) return res.status(404).json({error: `Department ${departmentId} does not exist`});

    const sparkInfo = yield sparkApi.getVolunteerProfile(userId, 15 * 1000);

    // invalid profile
    if (!sparkInfo) {
        return res.status(404).json({error: 'Invalid Midburn Profile'})
    }

    // remove request
    yield VolunteerRequest.findOneAndRemove({
        userId: userId,
        eventId: eventId,
        departmentId: departmentId
    });

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
        deleted: false,
        sparkInfo: {
            validProfile: true,
            firstName: sparkInfo['first_name'],
            lastName: sparkInfo['last_name'],
            hasTicket: sparkInfo['has_ticket'],
            numOfTickets: sparkInfo['num_of_tickets'],
            phone: sparkInfo['phone'],
            lastUpdate: Date.now()
        }
    });

    yield volunteer.save();

    return res.json(volunteer);
}));

// Add multiple volunteers to department
router.post('/departments/:departmentId/volunteers/', co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;
    const eventId = req.userDetails.eventId;

    // todo: enable for dep managers when spark will work
    if (!permissionsUtils.isAdmin(req.userDetails)) {
        // if (!permissionsUtils.isDepartmentManager(req.userDetails, departmentId)) {
        return res.status(403).json([{"error": "Action is not allowed - User doesn't have manager permissions for department " + departmentId}]);
    }

    const department = yield Department.findOne({_id: departmentId, eventId, deleted: false});
    if (_.isEmpty(department)) return res.status(404).json({error: `Department ${departmentId} does not exist`});

    const responses = [];
    const newVolunteers = [];
    const emails = req.body.emails;

    // todo: get profile when spark will work
    // const volunteerDetailsByEmail = yield sparkApi.getProfileByMail(emails);

    for (let i = 0; i < emails.length; i++) {
        const email = emails[i];

        // todo: check profile when spark will work
        // if (!(email in volunteerDetailsByEmail)) {
        //     responses.push({email: email, status: 'Failed'});
        //     continue;
        // }

        // existing volunteer
        const existingVolunteer = yield Volunteer.findOne({
            departmentId,
            eventId,
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
            eventId,
            permission: req.body.permission,
            yearly: req.body.yearly,
            deleted: false,
            sparkInfo: null
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
    const eventId = req.userDetails.eventId;

    const department = yield Department.findOne({_id: departmentId, eventId, deleted: false});
    if (_.isEmpty(department)) return res.status(404).json({error: `Department ${departmentId} does not exist`});

    if (!permissionsUtils.isDepartmentManager(req.userDetails, departmentId)) {
        return res.status(403).json([{"error": "Action is not allowed - User doesn't have manager permissions for department " + departmentId}]);
    }

    const volunteerId = req.params.volunteerId;
    const volunteer = yield Volunteer.findOne({_id: volunteerId, departmentId, eventId, deleted: false});
    if (_.isEmpty(volunteer)) return res.status(404).json({error: `Volunteer ${volunteerId} does not exist`});

    const updatedVolunteer = req.body;
    let currentVolunteerAllocationsDetails = {
        allocatedTickets: (volunteer._doc.allocationsDetails && volunteer._doc.allocationsDetails.allocatedTickets) ? volunteer._doc.allocationsDetails.allocatedTickets : 0,
        allocatedEarlyEntrancePhase1: (volunteer._doc.allocationsDetails && volunteer._doc.allocationsDetails.allocatedEarlyEntrancePhase1) ? volunteer._doc.allocationsDetails.allocatedEarlyEntrancePhase1 : false,
        allocatedEarlyEntrancePhase2: (volunteer._doc.allocationsDetails && volunteer._doc.allocationsDetails.allocatedEarlyEntrancePhase2) ? volunteer._doc.allocationsDetails.allocatedEarlyEntrancePhase2 : false,
        allocatedEarlyEntrancePhase3: (volunteer._doc.allocationsDetails && volunteer._doc.allocationsDetails.allocatedEarlyEntrancePhase3) ? volunteer._doc.allocationsDetails.allocatedEarlyEntrancePhase3 : false
    };


    for (const key in updatedVolunteer) {
        if (updatedVolunteer.hasOwnProperty(key)) {
            if (key === 'allocationsDetails') {
                let errorMessage = yield checkUpdatedVolunteerAllocationDetailsIsValid(departmentId, currentVolunteerAllocationsDetails, updatedVolunteer.allocationsDetails);
                if (errorMessage) {
                    return res.status(403).json([{"error": errorMessage}]);
                }
            }
            volunteer[key] = updatedVolunteer[key];
        }
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

    const eventId = req.userDetails.eventId;
    const volunteerId = req.params.volunteerId;
    const volunteer = yield Volunteer.findOne({_id: volunteerId, departmentId, eventId, deleted: false});
    if (_.isEmpty(volunteer)) return res.status(404).json({error: `Volunteer ${volunteerId} does not exist`});

    volunteer.deleted = true;
    yield volunteer.save();
    return res.json({status: "done"});
}));

module.exports = router;