const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DepartmentFormSchema = new Schema({
    departmentId: String,
    form: [{
      question : String,
      questionType : String,
      options: [String]
    }]
});

const DepartmentForm = mongoose.model('DepartmentForm', DepartmentFormSchema);

module.exports = DepartmentForm;
