import React, {Component} from 'react';
import {Checkbox, ControlLabel, FormControl, FormGroup, Radio} from 'react-bootstrap'
import Linkify from 'react-linkify';
import FormLanguagePicker from "../FormLanguagePicker/FormLanguagePicker";
import classNames from "classnames";
import "./FormViewer.scss";

export default class FormViewer extends Component {
    constructor(props) {
        super(props);

        this.state = {language: "he"};

        this.setLanguage = this.setLanguage.bind(this);
    }

    setLanguage(language) {
        this.setState({language})
    }

    render() {
        const {questions} = this.props;
        const {language} = this.state;

        if (questions.length === 0) {
            return <div>Nothing to show</div>
        }

        const rtl = language === "he";

        return (
            <div className="form-viewer">
                <FormLanguagePicker value={language} onChange={this.setLanguage}/>

                {questions.map((question, index) =>
                    <Linkify key={index} properties={{target: '_blank'}}>
                        <div className={classNames({rtl: rtl})}>
                            {question.questionType === 'text' && (
                                <FormGroup>
                                    <ControlLabel>{question.question[language]}</ControlLabel>
                                    <FormControl/>
                                </FormGroup>
                            )}
                            {question.questionType === 'textarea' && (
                                <FormGroup>
                                    <ControlLabel>{question.question[language]}</ControlLabel>
                                    <FormControl componentClass="textarea"/>
                                </FormGroup>
                            )}
                            {question.questionType === 'checkbox' && (
                                <FormGroup>
                                    <Checkbox inline><b>{question.question[language]}</b></Checkbox>
                                </FormGroup>
                            )}
                            {question.questionType === 'radio' && (
                                <FormGroup>
                                    <ControlLabel>{question.question[language]}</ControlLabel>
                                    {question.options.map((option, optionIndex) =>
                                        <Radio key={optionIndex}><span>{option[language]}</span></Radio>
                                    )}
                                </FormGroup>
                            )}
                            {question.questionType === 'checkboxes' && (
                                <FormGroup>
                                    <ControlLabel>{question.question[language]}</ControlLabel>
                                    {question.options.map((option, optionIndex) =>
                                        <Checkbox key={optionIndex}><span>{option[language]}</span></Checkbox>
                                    )}
                                </FormGroup>
                            )}
                        </div>
                    </Linkify>
                )}
            </div>
        );
    }
}
