import React, { Component } from 'react';
import {Button, Form, FormControl, FormGroup, ControlLabel, Checkbox, Radio} from 'react-bootstrap';
import Linkify from 'react-linkify';

import axios from 'axios';

require('./FromAnswersView.scss')

export default class FromAnswersView extends Component {
    constructor(props) {
        super(props);
    }

    render(){
        const rtl = true;

        if (!this.props.answers) {
            return <div>Loading...</div>
        }
        if (!this.props.answers.length) {
            return <div>Nothing to show</div>
        }
        return (
            <div className="form-answers-view">
                {this.props.answers && this.props.answers.map((question, index) => 

                    <Linkify key={`question-${index}`} properties={{target: '_blank'}}>
                        <div className={rtl ? 'rtl' : ''}>
                            {question.questionType === 'text' && (
                                <FormGroup controlId={`id-${index}`}>
                                    <ControlLabel>{question.question}</ControlLabel>
                                    <FormControl readOnly value={question.answer}/>
                                </FormGroup>
                            )}
                            {question.questionType === 'textarea' && (
                                <FormGroup controlId={`id-${index}`}>
                                    <ControlLabel>{question.question}</ControlLabel>
                                    <FormControl readOnly componentClass="textarea" value={question.answer}/>
                                </FormGroup>
                            )}
                            {question.questionType === 'checkbox' && (
                                <FormGroup controlId={`id-${index}`}>
                                    <Checkbox inline readOnly checked={question.answer}><b>{question.question}</b></Checkbox>
                                </FormGroup>
                            )}
                            {question.questionType === 'radio' && (
                                <FormGroup controlId={`id-${index}`}>
                                    <ControlLabel>{question.question}</ControlLabel>
                                    <FormControl readOnly value={question.answer}/>
                                </FormGroup>
                            )}
                            {question.questionType === 'checkboxes' && (
                                <FormGroup controlId={`id-${index}`}>
                                    <ControlLabel>{question.question}</ControlLabel>
                                    <FormControl readOnly value={question.answer}/>
                                </FormGroup>
                            )}
                        </div>
                    </Linkify>
                )}
            </div>
        )
    }
}