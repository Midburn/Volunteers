const express = require('express');
const router = express.Router();
const Admin = require('../models/admin');
const co = require('co');
const uuid = require('uuid/v1');

const addLocalAdmin = co.wrap(function*(_) {
  if (process.env.LOCAL_SPARK === 'true') {
    const admin = yield Admin.find({userId: 'user@midburn.org'});
    if (admin.length) {
      return;
    }
    const newAdmin = new Admin({
        '_id': uuid(),
        'userId': 'user@midburn.org'
    });
    yield newAdmin.save();
  }
})


router.get('/permissions/me', co.wrap(function*(req, res) {
  yield addLocalAdmin();

  const userId = req.userDetails.email;
  const permissions = [];

  const admin = yield Admin.find({userId: userId});
  if (admin.length) {
    permissions.push({permission:"admin"});
  }

  // TODO: read manager & volunteer permissions

  return res.json(permissions);
}));

router.get('/permissions/admins', co.wrap(function*(req, res) {
  yield addLocalAdmin();

  const userId = req.userDetails.email;
  const admin = yield Admin.find({userId: userId});
  if (!admin.length) {
    return res.status(403).json([{"error":"action is not allowed"}]);
  }

  const admins = yield Admin.find({});
  // TODO: maybe call spark and get some info?
  return res.json(admins);
}));


router.post('/permissions/admins', co.wrap(function*(req, res) {
  const userId = req.userDetails.email;
  const admin = yield Admin.find({userId: userId});
  if (!admin) {
    return res.status(403).json([{"error":"action is not allowed"}]);
  }

  const newAdminId = req.body.userId;
  // TODO: call spark and validate email
  // TODO: don't add the same email twice
  
  const newAdmin = new Admin({
      _id: uuid(),
      userId: newAdminId
  });
  yield newAdmin.save();
  return res.json(newAdmin);
}));

module.exports = router;
