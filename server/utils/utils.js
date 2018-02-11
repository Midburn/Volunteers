
module.exports = {
    isNewGeneralForm: answer => {
        let fillNewForm = false;
        if (answer && answer.form) {
            for (let i=0; i<answer.form.length; i++){
                if (answer.form[i].question === 'אני מאשר/ת שאני מעל גיל 18' || answer.form[i].question === 'I am over 18 years old') {
                    fillNewForm = true;
                }
            }
        }
        return fillNewForm;
    },


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