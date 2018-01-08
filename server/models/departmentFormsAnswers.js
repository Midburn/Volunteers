const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DepartmentFormAnswerSchema = new Schema({
    departmentId: String,
    form: [{
      question : String,
      questionType : String,
      answer: String
    }]
});

const DepartmentFormAnswer = mongoose.model('DepartmentFormAnswer', DepartmentFormAnswerSchema);

module.exports = DepartmentFormAnswer;
