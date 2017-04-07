import React from 'react';
import {Modal, OverlayTrigger, Button, FormControl, FormGroup, ControlLabel, Checkbox } from 'react-bootstrap';
import update from 'immutability-helper';

import DropdownFilter from '../DropdownFilter/DropdownFilter.js';
import DropdownConverter from '../../DropdownConverter.js';

require('./VolunteerAddModal.css')

export default class VolunteerAddModal extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            email: '',
            department: '',
            emailError: false
        };

        this.handleSubmit=this.handleSubmit.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handlechange = this.handleChange.bind(this);
        this.getInputChangeHandler = this.getInputChangeHandler.bind(this);
        this.splitEmailString = this.splitEmailString.bind(this);
        this.validateEmail = this.validateEmail.bind(this);
        this.testLastEmail = this.testLastEmail.bind(this);
        this.displayEmailError = this.displayEmailError.bind(this);
        this.getRolesOptions = this.getRolesOptions.bind(this);
        this.getDepartmentOptions = this.getDepartmentOptions.bind(this);
    }
    
    getInputChangeHandler(field){
        return (event) => this.handleChange(field,event);
    }

    handleChange(field, event){
        console.log(`VolunteerAddModal.handleInputChange. field ${field}`);
        let converter = new DropdownConverter();
        let val = event.target.value;
        if(field === 'email' && val[val.length -1] === ',') {
            if(this.testLastEmail(val)){
                this.displayEmailError(false);
            } else {
                this.displayEmailError(true);
            }
        }
        //TODO convert department to deparmentId either here or on submition
        this.setState( (state) => update(state,{$merge:{[field]:converter.convertFromDisplay(val)}} ));

    }

    handleSubmit(){
        console.log(`VolunteerAddModal.handleSubmit: state:${this.state}`);
       
        let emails = this.splitEmailString(this.state.email);
        console.log(`VolunteerAddModal.handleSubmit: role:${this.state.role}, department:${this.state.department}, emails:${emails}`);
        //TODO convert department to deparmentId either here or on change or on upper class
        this.props.onSubmit(this.state.department,this.state.role,this.state.production,emails);
        this.handleClose();
    }
    
    handleClose(){
        // Clear current state
        var newState = Object.keys(this.state).reduce(function(previous, current) {
            previous[current] = '';
            return previous;
        }, {});
        this.setState(newState);
        // Close modal
        this.props.onHide();
    }

    validateEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    splitEmailString(emailStr){
        console.log(`emails string:${emailStr}`)
        let emailArr = emailStr.split(',');
        let filteredArr = emailArr.filter(this.validateEmail);
        console.log((emailArr.length - filteredArr.length) + ' emails were incorrect');
        return filteredArr;
    }

    testLastEmail(email) {
        let emailArr = email.split(',');
        return this.validateEmail(emailArr[emailArr.length - 2]);
    }

    displayEmailError(curr) {
        this.setState({emailError: curr});//TODO When not converted to bool the button get a string. Verify why and remove this etra safety
    }

    getRolesOptions(){
        var roles =  this.props.roles.map(function(role) {return role['name']})
        roles = ["Choose Volunteer Role"].concat(roles)
        return roles
    }

    getDepartmentOptions(){
        var departments =  this.props.departments.map(function(role) {return role['name']})
        departments = ["Choose Department"].concat(departments)
        return departments
    }

    render(){
        let converter = new DropdownConverter();
        let errorDiv;
        if(this.state.emailError) {
            errorDiv = <div className="error-div">Invalid email</div>
        }
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
                                {
                                    this.getDepartmentOptions().map(
                                    (option)=> <option value={option} key={option}>{option}</option>
                                    )    
                                }
                        </FormControl>
                    </FormGroup>

                    <FormGroup controlId="Role">
                        <ControlLabel>Role</ControlLabel>
                        <FormControl componentClass="select" onChange ={this.getInputChangeHandler('role')}
                            value={this.state.role}
                            className="form-control" >
                                {
                                    this.getRolesOptions().map(
                                    (option)=> <option value={option} key={option}>{option}</option>
                                    )    
                                }
                        </FormControl>
                    </FormGroup>

                    <FormGroup controlId="Production">
                        <ControlLabel>Production</ControlLabel>
                        <FormControl componentClass="select" onChange ={this.getInputChangeHandler('production')}
                            value={converter.convertToDisplay(this.state.production)}
                            className="form-control" >
                                {
                                    ['Production Volunteer', 'Yes', 'No'].map(
                                    (option)=> <option value={option} key={option}>{option}</option>
                                    )    
                                }
                        </FormControl>
                    </FormGroup>

                    <FormGroup controlId="email">
                        <ControlLabel>User Email</ControlLabel>
                        <FormControl componentClass="textarea" onChange={this.getInputChangeHandler('email')}
                            value={this.state.email}
                            className={"form-control" + (this.state.emailError ? ' error' : '')} placeholder="Please enter all volunteer emails separated by commas"></FormControl>
                    </FormGroup>
                    {errorDiv}
                </Modal.Body>
            <Modal.Footer>
                <Button onClick={this.handleClose}>Close</Button>
                <Button bsStyle="primary" onClick={this.handleSubmit} disabled={!!this.state.emailError}>Add Volunteer</Button>
            </Modal.Footer>
            </Modal>
        )
    }
}