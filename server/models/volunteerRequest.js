const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const volunteerRequestSchema = new Schema({
    userId: String,
    departmentId: String,
    eventId: String,
    status: String,
    approved: Boolean
});

const VolunteerRequest = mongoose.model('VolunteerRequest', volunteerRequestSchema);

module.exports = VolunteerRequest;
