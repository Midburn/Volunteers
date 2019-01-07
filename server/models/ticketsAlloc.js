const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TicketsAllocSchema = new Schema({
    _id: String,
    eventId: String,
    startDate: Date,
    endDate: Date,
    description: String
}, {_id: false, timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});

const TicketsAlloc = mongoose.model('TicketsAlloc', TicketsAllocSchema);

module.exports = TicketsAlloc;