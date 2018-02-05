const express = require('express');
const router = express.Router();
const Admin = require('../models/admin');
const co = require('co');
const uuid = require('uuid/v1');
const permissionsUtils = require('../utils/permissions');

const addLocalAdmin = co.wrap(function* (userDetails) {
    if (process.env.LOCAL_SPARK === 'true') {
        if (permissionsUtils.isAdmin(userDetails)) {
            return;
        }


        const admin = yield Admin.find({userId: 'user@midburn.org'});
        if (admin && admin.length) {
            return;
        }
        const newAdmin = new Admin({
            '_id': uuid(),
            'userId': 'user@midburn.org'
        });
        yield newAdmin.save();
    }
});


router.get('/public/permissions/me', co.wrap(function* (req, res) {
    yield addLocalAdmin(req.userDetails);
    const permissions = yield permissionsUtils.getPermissions(req.userDetails);
    return res.json(permissions);
}));

router.get('/permissions/admins', co.wrap(function* (req, res) {
    yield addLocalAdmin(req.userDetails);
    if (!req.userDetails || !permissionsUtils.isAdmin(req.userDetails)) {
        return res.status(403).json([{"error": "action is not allowed"}]);
    }

    const admins = yield Admin.find({});
    // TODO: maybe call spark and get some info?
    return res.json(admins);
}));


router.post('/permissions/admins', co.wrap(function* (req, res) {
    if (!permissionsUtils.isAdmin(req.userDetails)) {
        return res.status(403).json([{"error": "Action is not allowed - User doesn't have admin permissions"}]);
    }

    const newAdminId = req.body.userId;
    const admin = yield Admin.find({userId: newAdminId});
    if (admin) {
        return res.json(admin);

    }
    // TODO: call spark and validate email

    const newAdmin = new Admin({
        _id: uuid(),
        userId: newAdminId
    });
    yield newAdmin.save();
    return res.json(newAdmin);
}));

module.exports = router;
