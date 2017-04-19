const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shiftSchema = new Schema({
  _id: Schema.Types.ObjectId,
  title: String,
  color: Number,
  department_id: Number,
  comment: String,
  start_time: Date,
  end_time: Date
});

const Shift = mongoose.model('Shift', shiftSchema);

module.exports = Shift;
