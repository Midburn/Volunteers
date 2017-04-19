const express = require('express');
const router = express.Router();
const Shift = require('../models/shift');
const ObjectID = require('mongodb').ObjectID

router.get('/:departmentId/shifts', function(req, res) {
  Shift.find({}, function(err, shifts) {
    if (err) return res.status(500).json({error: err});

    return res.json(shifts);
  });
});

router.post('/:departmentId/shifts', function(req, res) {
  const shift  = Shift({
    "_id": ObjectID(req.body._id),
    "title": req.body.title,
    "color": req.body.color,
    "department_id": req.body.department_id,
    "start_time": req.body.start_time,
    "end_time": req.body.end_time
  });

  Shift.save(function(err) {
    if (err) return res.status(500).json({error: err});

    return res.json(shift);
  });
});

router.put('/:departmentId/shifts/:shiftId', function(req, res) {
  Shift.findByIdAndUpdate(shiftId, req.body, function(err, shift) {
    if (err) return res.status(500).json({error: err});

    return res.json(shift);
  });
});

router.delete('/:departmentId/shifts/:shiftId', function(req, res) {
  Shift.findById(shiftId, function(err, shift) {
    if (err) return res.status(500).json({error: err});

    shift.remove(function(err) {
      if (err) return res.status(500).json({error: err});

      return res.json(shift);
    });
  });
});

module.exports = router
