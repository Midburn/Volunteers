import React, { Component } from 'react';
import {Modal, OverlayTrigger, Button, FormControl, FormGroup, ControlLabel, Checkbox, HelpBlock } from 'react-bootstrap';
import update from 'immutability-helper';
import axios from 'axios';

import DropdownFilter from '../DropdownFilter/DropdownFilter.js';
import DropdownConverter from '../../DropdownConverter.js';

require('./VolunteerAddModal.css')

export default class VolunteerAddModal extends Component{
    state = {
        email: '',
        department: -1,
        role: 4,
        production: false,
        errorTexts: [],
        isButtonEnabled: true
    }
    
    componentWillReceiveProps() {
        if (this.props.departments.length > 0 && this.state.department == -1) {
            this.setState((state)=>update(state, {department:{$set:this.props.departments[0].id}}))
        }
    }

    getInputChangeHandler = (field) => {
        return (event) => this.handleChange(field,event);
    }

    handleChange = (field, event) => {
        console.log(`VolunteerAddModal.handleInputChange. field ${field}`);
        let converter = new DropdownConverter();
        let val = event.target.value;

        this.state.errorTexts = []
        this.setState( (state) => update(state, {$merge:{[field]: converter.convertFromDisplay(val)}} ));
    }

    handleSubmit = () => {
        console.log(`VolunteerAddModal.handleSubmit: state:${this.state}`);
        
        let emails = this.splitEmailString(this.state.email);
        if (emails.length == 0) {
            this.state.errorTexts = ['Please enter an email address']
            this.setState(this.state)
            return;
        }

        var invalidEmails = []
        emails.forEach((email) => {
            if (!this.validateEmail(email)) {
                invalidEmails.push(email)
            }  
        })

        if (invalidEmails.length > 0) {
            this.state.errorTexts = invalidEmails.map((email) => {return `Error: ${email} - Invalid email`})
            this.setState(this.state)
            return;
        }

        // add volunteers
        let department = this.state.department
        let role = this.state.role
        let production = this.state.production

        this.state.errorTexts = ['Adding... ']
        this.state.isButtonEnabled = false
        this.setState(this.state)


        axios.post(`/api/v1/departments/${department}/volunteers`,
            {
                role: role,
                is_production: production,
                emails: emails
            })
            .then(response => {
                this.state.isButtonEnabled = true
                this.props.onSuccess() 
                this.setState(this.state)
                this.handleServerResponse(response)
            })
            .catch(error => {
                this.state.errorTexts = ['Server Error']
                this.state.isButtonEnabled = true
                this.setState(this.state)
            });
        // let emails = this.splitEmailString(this.state.email);
        // console.log(`VolunteerAddModal.handleSubmit: role:${this.state.role}, department:${this.state.department}, emails:${emails}`);
        // this.props.onSubmit(this.state.department,this.state.role,this.state.production,emails);
        // this.handleClose();
    }

    handleServerResponse = (response) => {
        console.log(response)
        var errors = []
        var successCounter = 0

        response.data.forEach(({email, status}) => {
            if (status != 'OK') {
                errors.push(`Error: ${email} - ${status}`)
            } else {
                successCounter += 1
            }
        })

        var text = []
        if (successCounter > 1) {
            text.push(`${successCounter} volunteers were added successfully`)
        } else if (successCounter == 1) {
            text.push(`1 volunteer was added successfully`)
        }
        text = text.concat(errors)

        this.state.errorTexts = text
        this.setState(this.state)
    }
    
    handleClose = () => {
        // Close modal
        this.props.onHide();
    }

    validateEmail = (email) => {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    splitEmailString = (emailStr) => {
        console.log(`emails string:${emailStr}`)
        var emailArr = emailStr.split(/\r|\n/).map((email) => {return email.trim()})
        emailArr = emailArr.filter((email) => { return email != '' }); 

        return emailArr
        // let filteredArr = emailArr.filter(this.validateEmail);
        // console.log((emailArr.length - filteredArr.length) + ' emails were incorrect');
        // return filteredArr;
    }

    testLastEmail = (email) => {
        let emailArr = email.split(',');
        return this.validateEmail(emailArr[emailArr.length - 2]);
    }

    getRolesOptions = () => {
        if (this.props.roles == undefined || this.props.roles.length == 0) {
            return <option value="" key="">Loading..</option>
        }

        return this.props.roles.map(({name, id}) => 
            <option value={id} key={name}>{name}</option>
        )
    }

    getDepartmentOptions = () => {
        if (this.props.departments == undefined || this.props.departments.length == 0) {
            return <option value="" key="">Loading..</option>
        }

        return this.props.departments.map(({name, id}) => 
            <option value={id} key={name}>{name}</option>
        )
    }

    getErrorText = () => (
        <ul>{this.state.errorTexts.map((text, index) => <li key={`li-${index}`}>{text}</li>)}</ul>
    )

    render(){
        let converter = new DropdownConverter();

        return (
            <Modal show={this.props.show} onHide={this.handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add new volunteer</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <FormGroup controlId="Department">
                        <ControlLabel>Department</ControlLabel>
                        <FormControl componentClass="select" onChange={this.getInputChangeHandler('department')}
                            value={this.state.department}
                            className="form-control" >
                                {this.getDepartmentOptions()}
                        </FormControl>
                    </FormGroup>

                    <FormGroup controlId="Role">
                        <ControlLabel>Role</ControlLabel>
                        <FormControl componentClass="select" onChange ={this.getInputChangeHandler('role')}
                            value={this.state.role}
                            className="form-control" >
                                {this.getRolesOptions()}
                        </FormControl>
                    </FormGroup>

                    <FormGroup controlId="Production">
                        <ControlLabel>Production</ControlLabel>
                        <FormControl componentClass="select" onChange ={this.getInputChangeHandler('production')}
                            value={converter.convertToDisplay(this.state.production)}
                            className="form-control" >
                                {
                                    ['Yes', 'No'].map(
                                    (option)=> <option value={option} key={option}>{option}</option>
                                    )    
                                }
                        </FormControl>
                    </FormGroup>

                    <FormGroup controlId="email">
                        <ControlLabel>User Email</ControlLabel>
                        <FormControl componentClass="textarea" onChange={this.getInputChangeHandler('email')}
                            value={this.state.email}
                            className="form-control" placeholder="Please enter all volunteer emails - one in each line"></FormControl>
                    </FormGroup>
                    {this.getErrorText()}
                </Modal.Body>
            <Modal.Footer>
                <Button onClick={this.handleClose}>Close</Button>
                <Button bsStyle="primary" onClick={this.handleSubmit} disabled={!this.state.isButtonEnabled}>Add Volunteer</Button>
            </Modal.Footer>
            </Modal>
        )
    }
}