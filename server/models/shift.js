const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shiftSchema = new Schema({
    _id: String,
    title: String,
    color: String,
    departmentId: Number,
    comment: String,
    startDate: Date,
    endDate: Date,
    volunteers: {},
    reported: [String]
}, {_id: false});

const Shift = mongoose.model('Shift', shiftSchema);

module.exports = Shift;
