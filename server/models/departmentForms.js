const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DepartmentFormSchema = new Schema({
    departmentId: String,
    form: [{
        question: {
            en: String,
            he: String
        },
        questionType: String,
        options: [
            {
                en: String,
                he: String
            }
        ]
    }]
});

const DepartmentForm = mongoose.model('department-form', DepartmentFormSchema);

module.exports = DepartmentForm;
