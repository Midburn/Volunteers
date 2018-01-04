import React, { Component } from 'react';
import {Button, FormGroup, FormControl, ControlLabel, Checkbox, Radio} from 'react-bootstrap'

const DEFAULT_LOGO = 'https://yt3.ggpht.com/-t7buXM4UqEc/AAAAAAAAAAI/AAAAAAAAAAA/n5U37nYuExw/s900-c-k-no-mo-rj-c0xffffff/photo.jpg';

export default class JoinFormPreview extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {questions} = this.props;

    if (questions.length === 0) {
      return <div>Nothing to show</div>
    }

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
              {question.options.map((option, i) => option.trim() &&
                <Radio key={i} name={`radio-${index}`}>{option}</Radio>
              )}
            </FormGroup>
            )}
            {question.questionType === 'checkboxes' && (
            <FormGroup>
              <ControlLabel>{question.question}</ControlLabel>
              {question.options.map((option, i) => option.trim() &&
                <Checkbox key={i}>{option}</Checkbox>
              )}
            </FormGroup>
            )}
          </div>
        )}
      </div>
    );
  }
}
