const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const departmentSchema = new Schema({
    _id: String,
    eventId: String,
    basicInfo: {
        nameEn: String,
        nameHe: String,
        descriptionEn: String,
        descriptionHe: String,
        imageUrl: String
    },
    status: {
        active: Boolean,
        visibleToJoin: Boolean,
        availableToJoin: Boolean
    },
    deleted: Boolean,
    tags: [String],
    allocationsDetails: {
        maxAllocatedTickets: {type: Number, default: 0},
        maxAllocatedEarlyEntrancesPhase1: {type: Number, default: 0},
        maxAllocatedEarlyEntrancesPhase2: {type: Number, default: 0},
        maxAllocatedEarlyEntrancesPhase3: {type: Number, default: 0}
    }
}, {_id: false, timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
