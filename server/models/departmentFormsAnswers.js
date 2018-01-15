const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DepartmentFormAnswerSchema = new Schema({
    departmentId: String,
    userId: String,
    eventId: String,
    form: [{
        question: String,
        questionType: String,
        answer: String
    }]
}, {timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});

const DepartmentFormAnswer = mongoose.model('DepartmentFormAnswer', DepartmentFormAnswerSchema);

module.exports = DepartmentFormAnswer;
