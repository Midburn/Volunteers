const express = require("express");
const router = express.Router();
const DepartmentForm = require("../models/departmentForms");
const co = require("co");
const _ = require('lodash');

router.get("/departments/:departmentId/form", co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;

    const departmentForm = yield DepartmentForm.find({
        departmentId: departmentId
    });

    return res.json(departmentForm);
}));

router.post("/departments/:departmentId/forms", co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;
    const form = req.params.form;

    const departmentForm = new DepartmentForm({
        departmentId: departmentId,
        form: form
    });

    yield departmentForm.save();

    return res.json(departmentForm);
}));

router.put("/departments/:departmentId/forms", co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;
    const form = req.params.form;

    const departmentForm = yield DepartmentForm.findOne({
        departmentId: departmentId
    });

    departmentForm.form = form;

    yield departmentForm.save();

    return res.json(departmentForm);
}));

router.delete("/departments/:departmentId/forms", co.wrap(function* (req, res) {
    const departmentId = req.params.departmentId;

    const departmentForm = yield DepartmentForm.findOne({
        departmentId: departmentId
    });

    if (_.isEmpty(departmentForm)) return res.status(404).json({error: "Form not exists for given department"});

    yield departmentForm.remove();

    return res.json(departmentForm);
}));

module.exports = router;