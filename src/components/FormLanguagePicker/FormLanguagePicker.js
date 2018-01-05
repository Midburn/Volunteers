import React from 'react';
import classNames from "classnames";
import "./FormLanguagePicker.scss";

const languages = ["he", "en"];

const FormLanguagePicker = ({value, onChange}) =>
    <div className="form-language-picker">
        {languages.map(language =>
            <div key={language}
                 className={classNames("language", {selected: value === language})}
                 onClick={() => onChange(language)}
            >
                {language}
            </div>)}
    </div>;

export default FormLanguagePicker;