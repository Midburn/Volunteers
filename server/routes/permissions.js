const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const co = require('co');


router.get('/permissions/me', co.wrap(function*(req, res) {
  const user_id = req.userDetails.email;
  const admin = yield Admin.find({user_id: user_id});
  if (admin.length || process.env.LOCAL_SPARK === 'true') {
    return res.json([{"permission":"admin"}]);
  }

  // TODO: read permissions
  return [];
}));

router.get('/permissions/admins', co.wrap(function*(req, res) {
  const user_id = req.userDetails.email;
  const admin = yield Admin.find({user_id: user_id});
  if (!admin.length && process.env.LOCAL_SPARK !== 'true') {
    return res.status(403).json([{"error":"action is not allowed"}]);
  }

  const admins = yield Admin.find({});
  // TODO: maybe call spark and get some info?
  return res.json(admins);
}));


router.post('/permissions/admins', co.wrap(function*(req, res) {
  const user_id = req.userDetails.email;
  const admin = yield Admin.find({user_id: user_id});
  if (!admin) {
    return res.status(403).json([{"error":"action is not allowed"}]);
  }

  const newAdminId = req.body.user_id;
  // TODO: call spark and validate email
  // TODO: don't add the same email twice
  
  const newAdmin = new Admin({
      '_id': uuid(),
      'userId': newAdminId
  });
  yield newAdmin.save();
  return res.json(newAdmin);
}));

module.exports = router;
