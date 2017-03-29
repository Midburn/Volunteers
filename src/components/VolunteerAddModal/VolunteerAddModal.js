import React from 'react';
import {Modal, OverlayTrigger, Button, FormControl, FormGroup, ControlLabel, Checkbox } from 'react-bootstrap';
import update from 'immutability-helper';

import DropdownFilter from '../DropdownFilter/DropdownFilter.js';
import DropdownConverter from '../../DropdownConverter.js';

export default class VolunteerAddModal extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            email: '',
            department: ''
        };

        this.handleSubmit=this.handleSubmit.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handlechange = this.handleChange.bind(this);
        this.getInputChangeHandler = this.getInputChangeHandler.bind(this);
    }
    
    getInputChangeHandler(field){
        return (event) => this.handleChange(field,event);
    }

    handleChange(field, event){
        console.log('VolunteerAddModal.handleInputChange');
        let converter = new DropdownConverter();
        let val = event.target.value;
        this.setState( (state) => update(state,{$merge:{[field]:converter.convertFromDisplay(val)}} ));
    }

    handleSubmit(){
        console.log('VolunteerAddModal.handleSubmit');
        console.log(this.state);
        this.props.onSubmit(this.state.email, this.state.department, this.state);
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

    render(){
        let converter = new DropdownConverter();
        return (
            <Modal show={this.props.show} onHide={this.handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add new volunteer</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <FormGroup controlId="email">
                        <ControlLabel>User Email</ControlLabel>
                        <FormControl type="text" onChange={this.getInputChangeHandler('email')}
                            value={this.state.email}
                            className="form-control" autoFocus placeholder="New Volunteer Email"></FormControl>
                    </FormGroup>

                    <FormGroup controlId="Department">
                        <ControlLabel>Department</ControlLabel>
                        <FormControl componentClass="select" onChange={this.getInputChangeHandler('department')}
                            value={this.state.department}
                            className="form-control" >
                                {
                                    ['Choose Department', 'Tech','Navadim','Mapatz','Tnua','Merkazia'].map(
                                    (option)=> <option value={option} key={option}>{option}</option>
                                    )    
                                }
                        </FormControl>
                    </FormGroup>

                    <FormGroup controlId="Type">
                        <ControlLabel>Type</ControlLabel>
                        <FormControl componentClass="select" onChange={this.getInputChangeHandler('type')}
                            value={this.state.type}
                            className="form-control" >
                                {
                                    ['Choose Volunteer Type', 'Manager','Day Manager','Shift Manager','Production','Department Manager'].map(
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
                                    ['Choose Volunteer Role', 'Manager','Day Manager','Shift Manager','Production','Department Manager','Volunteer','Team Leader'].map(
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

                </Modal.Body>
            <Modal.Footer>
                <Button onClick={this.handleClose}>Close</Button>
                <Button bsStyle="primary" onClick={this.handleSubmit}>Add Volunteer</Button>
            </Modal.Footer>
            </Modal>
        )
    }
}