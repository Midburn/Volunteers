const express = require("express");
const router = express.Router();
const DepartmentForm = require("../models/departmentForms");
const DepartmentFormAnswer = require("../models/departmentFormsAnswers");
const co = require("co");
const _ = require('lodash');
const GENERAL = 1;

const getDepartmentFrom = co.wrap(function* (departmentId) {
    const departmentForm = yield DepartmentForm.findOne({
        departmentId: departmentId,
    });

    return departmentForm;
});

const getAnswer = co.wrap(function* (departmentId, userId, eventId) {
    const answer = yield DepartmentFormAnswer.findOne({
        departmentId: departmentId,
        userId: userId,
        eventId: eventId
    })
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

router.get("/departments/:departmentId/forms", co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;

    const departmentForm = yield getDepartmentFrom(departmentId);

    return res.json(departmentForm ? departmentForm.form : []);
}));

router.post("/departments/:departmentId/forms", co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;
    const form = req.body.form;

    const departmentForm = yield saveDepartmentFrom(departmentId, form);

    return res.json(departmentForm.form);
}));

router.delete("/departments/:departmentId/forms", co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;

    const departmentForm = yield DepartmentForm.findOne({
        departmentId: departmentId
    });

    if (_.isEmpty(departmentForm)) return res.status(404).json({error: "Form not exists for given department"});

    yield departmentForm.remove();

    return res.json(departmentForm.form);
}));

// Retunes the answer of a department form for the current user
router.get('/departments/:departmentId/forms/events/:eventId/answer', co.wrap(function* (req, res) {
    const userId = req.userDetails.email;
    const departmentId = req.params.departmentId;
    const eventId = req.params.eventId;
    const answer = yield getAnswer(departmentId, userId, eventId);
    return res.json(answer ? answer : '');
}));


router.get("/form", co.wrap(function* (req, res) {
    const departmentForm = yield getDepartmentFrom(GENERAL);

    return res.json(departmentForm ? departmentForm.form : []);
}));

router.post("/form", co.wrap(function* (req, res) {
    const form = req.body.form;

    const departmentForm = yield saveDepartmentFrom(GENERAL, form);

    return res.json(departmentForm.form);
}));


// Returns the answers of the general form for the current user.
router.get('/form/events/:eventId/answer', co.wrap(function* (req, res) {
    const userId = req.userDetails.email;
    const eventId = req.params.eventId;
    const answer = yield getAnswer(GENERAL, userId, eventId);

    return res.json(answer ? answer : '');
}));

module.exports = router;