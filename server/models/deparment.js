const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const departmentSchema = new Schema({
    _id: String,
    nameEn: String,
    nameHe: String,
    active: Boolean,
    tags: [String]
}, {_id: false});

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
