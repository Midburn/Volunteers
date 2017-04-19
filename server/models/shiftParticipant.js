const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shiftParticipantSchema = new Schema({
  _id: Schema.Types.ObjectId,
  shiftId: Schema.Types.ObjectId,
  participantId: Number,
  attended: Boolean
});

const ShiftParticipant = mongoose.model('ShiftParticipant', shiftParticipantSchema);

module.exports = ShiftParticipant;
