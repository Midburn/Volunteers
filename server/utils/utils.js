
module.exports = {
    firstNameFromGeneralForm: generalForm => {
        if (!generalForm || !generalForm.form) {
            return null;
        }

        for (var i=0; i<generalForm.form.length; i++) {
            if (generalForm.form[i].question === 'שם פרטי' || generalForm.form[i].question === 'First name') {
                return generalForm.form[i].answer;
            }
        }
        return null;
    },
    
    lastNameFromGeneralForm: generalForm => {
        if (!generalForm || !generalForm.form) {
            return null;
        }

        for (var i=0; i<generalForm.form.length; i++) {
            if (generalForm.form[i].question === 'שם משפחה' || generalForm.form[i].question === 'Last Name') {
                return generalForm.form[i].answer;
            }
        }
        return null;
    }
}