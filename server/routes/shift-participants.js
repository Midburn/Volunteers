const express = require('express');
const router = express.Router();
const ShiftParticipant = require('../models/shiftParticipant');

router.get('/:departmentId/shifts/:shiftId/participants', function(req, res) {
  ShiftParticipant.find({shiftId: shiftId}, function(err, shiftParticipants) {
    if (err) throw err;

    return res.json(shiftParticipants);
  });
});

router.post('/:departmentId/shifts/:shiftId/participants', function(req, res) {
  const shiftParticipant  = new ShiftParticipant({
    shiftId: shiftId,
    participantId: req.body.participantId,
    attended: false
  });

  shiftParticipant.save(function(err) {
    if (err) {

      return res.status(500).json({error: err});
    }

    return res.json(shiftParticipant);
  });
});

router.put('/:departmentId/shifts/:shiftId/participants/:participantId', function(req, res) {
  Comment.findOne({shiftId: shiftId, participantId: participantId}, function (err, shiftParticipant) {
    if (err) return handleError(err);

    shiftParticipant.attended = !shiftParticipant.attended;

    shiftParticipant.save(function(err) {
      if (err) {

        return res.status(500).json({error: err});
      }

      return res.json(shiftParticipant);
    });
  });
});

router.delete('/:departmentId/shifts/:shiftId/participants/:participantId', function(req, res) {
  ShiftParticipant.findOne({shiftId: shiftId, participantId: participantId}, function(err, shiftParticipant) {
    if (err) throw err;

    shiftParticipant.remove(function(err) {
      if (err) throw err;

      return res.json(shiftParticipant);
    });
  });
});

module.exports = router
