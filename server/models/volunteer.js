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
    contactEmail: String,
    contactPhone: String,
    deleted: Boolean,
    tags: [String],
    sparkInfo: {
        validProfile: Boolean,
        firstName: String,
        lastName: String,
        hasTicket: Boolean,
        numOfTickets: Number,
        phone: String,
        lastUpdate: Date
    },
    allocationsDetails: {
        allocatedTickets: {type: Number, default: 0, min: 0, max: 2},
        allocatedEarlyEntrancePhase1: {type: Boolean, default: false},
        allocatedEarlyEntrancePhase2: {type: Boolean, default: false},
        allocatedEarlyEntrancePhase3: {type: Boolean, default: false}
    }
}, {_id: false, timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});

const Volunteer = mongoose.model('Volunteer', volunteersSchema);
module.exports = Volunteer;
