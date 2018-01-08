const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const departmentSchema = new Schema({
    _id: String,
    basicInfo: {
        nameEn: String,
        nameHe: String,
        descriptionEn: String,
        descriptionHe: String,
        imageUrl: String
    },
    requestForm: [{
        question: String,
        questionType: String,
        options: [String]
    }],
    status: {
        active: Boolean,
        visibleToJoin: Boolean,
        availableToJoin: Boolean
    },
    deleted: Boolean,
    tags: [String]
}, {_id: false, timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
