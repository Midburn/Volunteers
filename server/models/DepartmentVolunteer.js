const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const departmentVolunteersSchema = new Schema({
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

const DepartmentVolunteers = mongoose.model('DepartmentVolunteers', departmentVolunteersSchema);

module.exports = DepartmentVolunteers;
