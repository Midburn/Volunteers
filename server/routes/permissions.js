const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const co = require('co');

router.get('/me', co.wrap(function*(req, res) {
  const user_id = req.userDetails.email;
  const admin = yield Admin.find({user_id: user_id});
  if (admin || process.env.LOCAL_SPARK === 'true') {
    return res.json([{"permission":"admin"}]);
  }

  // TODO: read permissions
  return [];
}));
module.exports = router;
