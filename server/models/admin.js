const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    _id: String,
    userId: String
}, {_id: false});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
