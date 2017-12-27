import React, { Component } from 'react';
import {Modal, Button, FormControl, FormGroup, ControlLabel, HelpBlock } from 'react-bootstrap';
import update from 'immutability-helper';
import axios from 'axios';

require('./VolunteerAddModal.css')

export default class VolunteerAddModal extends Component {
  constructor(props) {
    super(props);
    this.onEnter()
  }

  onEnter = _ => {
    const departmentId = this.props.departmentId ? this.props.departmentId : 
      (this.props.departments && this.props.departments.length ? this.props.departments[0]._id : '')
    this.state = {
      departmentId: departmentId,
      permission: 'volunteer',
      yearly: 'false',
      emails: [],

      status: [],
      isButtonEnabled: true
    }

    this.setState(this.state);
  }

  handleOptionsChange = event => {    
    const field = event.target.id;
    this.state[field] = event.target.value
    this.setState(this.state);
  }

  handleEmailsChange = event => {
    this.state.emails = [];
    const emails = event.target.value.split(/\r|\n/);
    emails.forEach(email => {
      const cleanEmail = email.replace(new RegExp(',', 'g'), '').trim();
      if (cleanEmail){
        this.state.emails.push(cleanEmail);
      }
    })
    this.setState(this.state);
  }

  isValidEmail = (email) => {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  handleSubmit = () => {
    if (!this.state.emails.length) {
        this.state.status = ['Please enter at least one email address']
        this.setState(this.state)
        return;
    }

    var invalidEmails = []
    this.state.emails.forEach((email) => {
        if (!this.isValidEmail(email)) {
            invalidEmails.push(email)
        }  
    })
    if (invalidEmails.length) {
        this.state.status = invalidEmails.map((email) => {return `Error: ${email} - Invalid email`})
        this.setState(this.state)
        return;
    }

    // add volunteers
    this.state.status = ['Adding... ']
    this.state.isButtonEnabled = false
    this.setState(this.state)
    axios.post(`/api/v1/departments/${this.state.departmentId}/volunteers`,
    {
        permission: this.state.permission,
        yearly: this.state.yearly === 'true' ? true : false,
        emails: this.state.emails
    })
    .then(response => {
        this.state.isButtonEnabled = true
        this.setState(this.state)
        this.handleServerResponse(response)
        // this.props.onSuccess() 
    })
    .catch(error => {
        this.state.status = ['Server Error']
        this.state.isButtonEnabled = true
        this.setState(this.state)
    });
  }
    
  handleServerResponse = response => {
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

    this.state.status = text
    this.setState(this.state)

    if (successCounter > 0) {
      this.props.onSuccess()
    } 
  }
    
  onHide = () => {
    this.props.onHide()
  }

  render(){
    return (
      <Modal show={this.props.show} onHide={this.onHide} onEnter={this.onEnter} bsSize="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Volunteers</Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          <div className="add-volunteer-options">
            {this.props.departments.length > 1 &&
            <FormGroup className="add-volunteer-form-group" controlId="departmentId">
              <ControlLabel>Department</ControlLabel>
              <FormControl componentClass="select" onChange={this.handleOptionsChange} value={this.state.departmentId}>
                {this.props.departments.map(department => 
                  <option key={department._id} value={department._id}>{department.basicInfo.nameEn}</option>
                )}
              </FormControl>
            </FormGroup>}
            <FormGroup className="add-volunteer-form-group" controlId="permission">
              <ControlLabel>Role</ControlLabel>
              <FormControl componentClass="select" onChange ={this.handleOptionsChange} value={this.state.permission}>
                <option value='manager'>Manager</option>
                <option value='volunteer'>Volunteer</option>
              </FormControl>
              <HelpBlock>Managers can edit all the department info and add volunteers</HelpBlock>
            </FormGroup>
            <FormGroup className="add-volunteer-form-group" controlId="yearly">
              <ControlLabel>Yearly Volunteer</ControlLabel>
              <FormControl componentClass="select" onChange = {this.handleOptionsChange} value={this.state.yearly}>
                <option value='true'>Yes</option>
                <option value='false'>No</option>
              </FormControl>
              <HelpBlock>Yearly volunteers are production volunteers</HelpBlock>
            </FormGroup>
          </div>
          <FormGroup controlId="emails">
              <ControlLabel>User Email</ControlLabel>
              <FormControl className="add-volunteer-emails" componentClass="textarea" onChange={this.handleEmailsChange}
                  placeholder="Please enter email addresses - one in each line"></FormControl>
          </FormGroup>
          {this.state.status.length > 0 &&
          <ul>{this.state.status.map((text, index) => <li key={`li-${index}`}>{text}</li>)}</ul>}
        </Modal.Body>
          
        <Modal.Footer>
          <Button onClick={this.onHide}>Close</Button>
          <Button bsStyle="primary" onClick={this.handleSubmit} disabled={!this.state.isButtonEnabled}>Add Volunteers</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}