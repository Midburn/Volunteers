import React, { Component } from 'react';
import {Button, FormGroup, FormControl, ControlLabel, Checkbox, Radio} from 'react-bootstrap'

const DEFAULT_LOGO = 'https://yt3.ggpht.com/-t7buXM4UqEc/AAAAAAAAAAI/AAAAAAAAAAA/n5U37nYuExw/s900-c-k-no-mo-rj-c0xffffff/photo.jpg';

export default class JoinFormPreview extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const basicInfo = this.props.department.basicInfo;
    const departmentLogo = basicInfo.imageUrl ? basicInfo.imageUrl : DEFAULT_LOGO;
    const questions = this.props.department.requestForm;

    return (
      <div style={{whiteSpace:'pre-wrap' ,minHeight:50}}>
        {questions.map((question, index) => 
          <div key={index.toString()}>
            {question.questionType === 'text' && (
            <FormGroup controlId={`question-${index}`}>
              <ControlLabel>{question.question}</ControlLabel>
              <FormControl/>
            </FormGroup>
            )}
            {question.questionType === 'textarea' && (
            <FormGroup controlId={`question-${index}`}>
              <ControlLabel>{question.question}</ControlLabel>
              <FormControl componentClass="textarea"/>
            </FormGroup>
            )}
            {question.questionType === 'checkbox' && (
            <FormGroup controlId={`question-${index}`}>
              <Checkbox inline><b>{question.question}</b></Checkbox>
            </FormGroup>
            )}
            {question.questionType === 'radio' && (
            <FormGroup>
              <ControlLabel>{question.question}</ControlLabel>
              {question.options.map(option => option.trim() &&
                <Radio name={`radio-${index}`}>{option}</Radio>
              )}
            </FormGroup>
            )}
            {question.questionType === 'checkboxes' && (
            <FormGroup>
              <ControlLabel>{question.question}</ControlLabel>
              {question.options.map(option => option.trim() &&
                <Checkbox>{option}</Checkbox>
              )}
            </FormGroup>
            )}
          </div>
        )}
      </div>
    );
  }
}
