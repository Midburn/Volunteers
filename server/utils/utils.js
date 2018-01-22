
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
    }
}