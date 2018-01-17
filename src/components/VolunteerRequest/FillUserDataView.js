import React, { Component } from 'react';
import {Button, Form, FormControl, FormGroup, ControlLabel, Checkbox, Radio} from 'react-bootstrap';
import axios from 'axios';

// require('./FillFormView.scss')

const emailTitle = {
    he: 'כתובת אימייל ליצירת קשר:',
    en: 'Contact Email Address:'
}
const phoneTitle = {
    he: 'מספר טלפון ליצירת קשר:',
    en: 'Contact Phone Number:'
}
const profileTitle = {
    he: 'פרופיל מידברן (במידה וקיים):',
    en: 'Midburn Profile (if exists):'
}

export default class FillUserDataView extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            contactEmail: '',
            contactPhoneNumber: '',
            profileEmail: '',

            showValidation: false
        }
    }

    handleTextChange = event => {
        const id = event.target.id;
        this.state[id] = event.target.value;
        this.setState(this.state);
    }

    submit = form => {

        this.props.onAnswer(this.state)   
    }
    

    render(){
        const language = this.props.language;
        const rtl = language === 'he';
        const isValid = !!this.state.contactEmail;


        return (
            <div className="fill-form-view">
                <Form>
                    <div className={rtl ? 'rtl' : ''}>
                        <FormGroup controlId="contactEmail">
                            <ControlLabel>{emailTitle[language]}</ControlLabel>
                            <FormControl onChange={this.handleTextChange} placeholder="email@gmail.com"/>
                        </FormGroup>
                        <FormGroup controlId="contactPhoneNumber">
                            <ControlLabel>{phoneTitle[language]}</ControlLabel>
                            <FormControl onChange={this.handleTextChange} placeholder="050-123456789"/>
                        </FormGroup>
                        <FormGroup controlId="profileEmail">
                            <ControlLabel>{profileTitle[language]}</ControlLabel>
                            <FormControl onChange={this.handleTextChange} placeholder="email@gmail.com"/>
                        </FormGroup>
                    </div>
                    <div className='button-container'>
                        <Button className="send" bsStyle="success" disabled={!isValid}
                                onClick={this.submit}>Send</Button>
                    </div>
                </Form>
            </div>
        )
    }
}