const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const departmentSchema = new Schema({
    _id: String,
    nameEn: String,
    nameHe: String,
    websiteURL: String,
    facebookPageUrl: String,
    twitterPageUrl: String,
    imageUrl: String,
    deleted: Boolean,
    tags: [String]
}, {_id: false});

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
