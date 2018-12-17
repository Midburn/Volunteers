const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventsPhasesSchema = new Schema({
    _id: String,
    eventId: String,
    phase1GrantingStartDate: Date,
    phase1GrantingEndDate: Date,
    phase2PurchaseStartDate: Date,
    phase2PurchaseEndDate: Date,
}, {_id: false, timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});

const eventsPhases = mongoose.model('EventsPhases', eventsPhasesSchema);

module.exports = eventsPhases;
