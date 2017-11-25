const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const co = require('co');

const isAdmin = req => {
  const user_id = req.userDetails.email;
  Admin.find({user_id: user_id})
  .then(admin => !!admin)
  .catch(error => false)
};

router.get('/', (req, res) => {
  return res.json([{"error":"may"}]);
})


router.get('/me', co.wrap(function*(req, res) {
  const user_id = req.userDetails.email;
  const admin = yield Admin.find({user_id: user_id});
  if (admin || process.env.LOCAL_SPARK === 'true') {
    return res.json([{"permission":"admin"}]);
  }

  // TODO: read permissions
  return [];
}));


router.get('/admins'), (req, res) => {
  return res.status(403).json([{"error":"action is not allowed"}]);
  // isAdmin(req)
  // .then(isAdmin => {
  //   if (!isAdmin) {
  //     return res.status(403).json([{"error":"action is not allowed"}]);
  //   }
    // const user_id = req.userDetails.email;
    // Admin.find({})
    // .then(admin => {
    //   // TODO: maybe call spark and get some info?
    //   return res.json(admins);
    // })  
    // .catch(error => {
    //   return res.status(400)
    // });
  // })
  // .catch(error => {
  //   return res.status(400)
  // });
};

// router.put('/admins'), (req, res) => {
//   isAdmin(req)
//   .then(isAdmin => {
//     if (!isAdmin) {
//       return res.status(403).json([{"error":"action is not allowed"}]);
//     }
//     const user_id = req.body.email;
//     const admin = new Admin({
//       '_id': shiftId,
//       'userId': user_id
//     });
//     Admin.save()
//     .then(() => {
//       return res.json(admin)
//     })
//     .catch(error => {
//       return res.status(400)
//     });
//   })
//   .catch(error => {
//     return res.status(400)
//   });
// };

module.exports = router;
