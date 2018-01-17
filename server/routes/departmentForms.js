const express = require("express");
const router = express.Router();
const DepartmentForm = require("../models/departmentForms");
const DepartmentFormAnswer = require("../models/departmentFormsAnswers");
const co = require("co");
const _ = require('lodash');
const GENERAL = 1;
const permissionsUtils = require('../utils/permissions');

const getDepartmentFrom = co.wrap(function* (departmentId) {
    return yield DepartmentForm.findOne({
        departmentId: departmentId
    });

    return departmentForm;
});

const getAnswer = co.wrap(function* (departmentId, userId, eventId) {
    const answer = yield DepartmentFormAnswer.findOne({
        departmentId: departmentId,
        userId: userId,
        eventId: eventId
    })
    return answer;
});

const saveDepartmentFrom = co.wrap(function* (departmentId, form) {
    let departmentForm = yield DepartmentForm.findOne({
        departmentId: departmentId
    });

    if (departmentForm) {
        departmentForm.form = form;
    } else {
        departmentForm = new DepartmentForm({
            departmentId: departmentId,
            form: form
        });
    }

    yield departmentForm.save();

    return departmentForm;
});

// PUBLIC - Returns a depertment form
router.get("/departments/:departmentId/forms", co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;

    const departmentForm = yield getDepartmentFrom(departmentId);

    return res.json(departmentForm ? departmentForm.form : []);
}));

// MANAGER - Updates a depertment form
router.post("/departments/:departmentId/forms", co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;
    const form = req.body.form;

    if (!permissionsUtils.isDepartmentManager(req.userDetails, departmentId)) {
        return res.status(403).json([{"error": "Action is not allowed - User doesn't have manager permissions for department " + departmentId}]);
    }

    const departmentForm = yield saveDepartmentFrom(departmentId, form);

    return res.json(departmentForm.form);
}));

// MANAGER - Deletes a depertment form
router.delete("/departments/:departmentId/forms", co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;

    if (!permissionsUtils.isDepartmentManager(req.userDetails, departmentId)) {
        return res.status(403).json([{"error": "Action is not allowed - User doesn't have manager permissions for department " + departmentId}]);
    }

    const departmentForm = yield DepartmentForm.findOne({
        departmentId: departmentId
    });

    if (_.isEmpty(departmentForm)) return res.status(404).json({error: "Form not exists for given department"});

    yield departmentForm.remove();

    return res.json(departmentForm.form);
}));

// PUBLIC - Returns if the userdata has answers to the department form or not
router.get('/departments/:departmentId/forms/events/:eventId/hasAnswer', co.wrap(function* (req, res) {
    if (!req.headers.userdata) {
        return res.status(400).json({error: "invalid request"});
    }
    const userdata = JSON.parse(req.headers.userdata);
    const userId = userdata.profileEmail;
    const eventId = req.params.eventId;
    const departmentId = req.params.departmentId;
    const answer = yield getAnswer(departmentId, userId, eventId);

    return res.json({hasAnswer: !!answer});
}));

// Retunes the answer of a department form for the current user
router.get('/departments/:departmentId/forms/events/:eventId/answer', co.wrap(function* (req, res) {
    const userId = req.userDetails.email;
    const departmentId = req.params.departmentId;
    const eventId = req.params.eventId;
    const answer = yield getAnswer(departmentId, userId, eventId);
    return res.json(answer ? answer : '');
}));

// PUBLIC - Submit answers to the department form
router.post('/departments/:departmentId/forms/events/:eventId/answer', co.wrap(function* (req, res) {
    if (!req.headers.userdata) {
        return res.status(400).json({error: "invalid request"});
    }
    const userdata = JSON.parse(req.headers.userdata);
    const userId = userdata.profileEmail;
    const departmentId = req.params.departmentId;
    const eventId = req.params.eventId;
    const answer = req.body;
    const formAnswer = new DepartmentFormAnswer({
        departmentId,
        userId,
        eventId,
        form: answer
    });
    yield formAnswer.save();
    return res.json(formAnswer);
}));


// PUBLIC - Returns the general form
router.get("/form", co.wrap(function* (req, res) {
    const departmentForm = yield getDepartmentFrom(GENERAL);

    return res.json(departmentForm ? departmentForm.form : []);
}));


// ADMIN - update the general form
router.post("/form", co.wrap(function* (req, res) {
    const form = req.body.form;

    if (!permissionsUtils.isAdmin(req.userDetails)){
        return res.status(403).json([{"error": "Action is not allowed - User doesn't have admin permissions"}]);
    }

    const departmentForm = yield saveDepartmentFrom(GENERAL, form);

    return res.json(departmentForm.form);
}));


// PUBLIC - Returns if the userdata has answers to the general form or not
router.get('/form/events/:eventId/hasAnswer', co.wrap(function* (req, res) {
    if (!req.headers.userdata) {
        return res.status(400).json({error: "invalid request"});
    }
    const userdata = JSON.parse(req.headers.userdata);
    const userId = userdata.profileEmail;
    const email = userdata.contactEmail;
    const eventId = req.params.eventId;
    
    let answer = null;
    if (userId) {
        answer = yield getAnswer(GENERAL, userId, eventId);
    }
    if (!answer && email) {
        answer = yield getAnswer(GENERAL, email, eventId);
    }
    console.log(answer);
    return res.json({hasAnswer: !!answer});
}));

// PUBLIC - Submit answers to the general form
router.post('/form/events/:eventId/answer', co.wrap(function* (req, res) {
    if (!req.headers.userdata) {
        return res.status(400).json({error: "invalid request"});
    }

    const userdata = JSON.parse(req.headers.userdata);
    const userId = userdata.profileEmail;
    const eventId = req.params.eventId;
    const answer = req.body;

    const formAnswer = new DepartmentFormAnswer({
        departmentId: GENERAL,
        userId,
        eventId,
        form: answer
    });
    yield formAnswer.save();
    return res.json(formAnswer);
}));

module.exports = router;