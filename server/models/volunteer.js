const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const volunteersSchema = new Schema({
    _id: String,
    userId: String,
    departmentId: String,
    eventId: String,
    permission: String,
    yearly: Boolean,
    comment: String,
    deleted: Boolean,
    tags: [String]
}, {_id: false});

const Volunteer = mongoose.model('Volunteer', volunteersSchema);
module.exports = Volunteer;
