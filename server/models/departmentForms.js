const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DepartmentFormSchema = new Schema({
    departmentId: String,
    form: [{
      questionEn : String,
      questionHe : String,
      questionType : String,
      options: [
          {
              labelEn: String,
              labelHe: String
          }
      ]
    }]
}, {_id: false});

const DepartmentForm = mongoose.model('DepartmentForm', DepartmentFormSchema);

module.exports = DepartmentForm;
