const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shiftSchema = new Schema({
    _id: String,
    title: String,
    color: String,
    departmentId: String,
    eventId: String,
    comment: String,
    startDate: Date,
    endDate: Date,
    volunteers: [{
        userId: String,
        isCheckedIn: String,
        comment: String
    }],
    reported: [String]
}, {_id: false, timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});

const Shift = mongoose.model('Shift', shiftSchema);

module.exports = Shift;
