const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const volunteersSchema = new Schema({
    _id: String,
    userId: String,
    departmentId: String,
    eventId: String,
    roleId: String,
    isProduction: Boolean,
    comment: String,
    modifiedDate: Date,
    deleted: Boolean,
    tags: [String]
}, {_id: false});

const Volunteers = mongoose.model('Volunteer', volunteersSchema);

module.exports = Volunteers;
