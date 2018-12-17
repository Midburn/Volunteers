const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventsPhasesSchema = new Schema({
    _id: String,
    eventId: String,
    phase1GrantingStart: Date,
    phase1GrantingEnd: Date,
    phase2PurchaseStart: Date,
    phase2PurchaseEnd: Date,
}, {_id: false, timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});

const eventsPhases = mongoose.model('EventsPhases', eventsPhasesSchema);

module.exports = eventsPhases;
