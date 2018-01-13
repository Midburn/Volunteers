const express = require("express");
const router = express.Router();
const DepartmentForm = require("../models/departmentForms");
const co = require("co");
const _ = require('lodash');
const GENERAL = 1;
const permissionsUtils = require('../utils/permissions');

const getDepartmentFrom = co.wrap(function* (departmentId) {
    return yield DepartmentForm.findOne({
        departmentId: departmentId
    });
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

    if (!permissionsUtils.isDepartmentManager(req.userDetails, departmentId)) {
        return res.status(403).json([{"error": "Action is not allowed - User doesn't have manager permissions for department " + departmentId}]);
    }

    const departmentForm = yield saveDepartmentFrom(departmentId, form);

    return res.json(departmentForm.form);
}));

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

router.get("/form", co.wrap(function* (req, res) {
    const departmentForm = yield getDepartmentFrom(GENERAL);

    return res.json(departmentForm ? departmentForm.form : []);
}));

router.post("/form", co.wrap(function* (req, res) {
    const form = req.body.form;

    if (!permissionsUtils.isAdmin(req.userDetails)){
        return res.status(403).json([{"error": "Action is not allowed - User doesn't have admin permissions"}]);
    }

    const departmentForm = yield saveDepartmentFrom(GENERAL, form);

    return res.json(departmentForm.form);
}));

module.exports = router;