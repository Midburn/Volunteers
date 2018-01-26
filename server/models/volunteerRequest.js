const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const volunteerRequestSchema = new Schema({
    userId: String,
    contactEmail: String,
    contactPhone: String,
    departmentId: String,
    eventId: String,
    status: String,
    approved: Boolean,
    comment: String,
    tags: [String]
}, {timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});

const VolunteerRequest = mongoose.model('VolunteerRequest', volunteerRequestSchema);

module.exports = VolunteerRequest;
