import React from 'react';
import {Modal, Button, FormGroup, HelpBlock, FormControl, ControlLabel, Alert} from 'react-bootstrap';
import axios from 'axios';
require('./VolunteerEditModal.css')

export default class VolunteerEditModal extends React.Component {
  constructor(props) {
      super(props);
      this.state = { 
        volunteer: {
          permission: 'volunteer',
          yearly: 'false'
        },
        hasChanges: false,
        isButtonEnabled: true
      }
  }

  onEnter = _ => {
    this.state = { 
      volunteer: {
        ...this.props.volunteer,
        permission: this.props.volunteer.permission,
        yearly: this.props.volunteer.yearly ? 'true' : 'false'
      },
      hasChanges: false
    }
    this.setState(this.state);
  }

  handleOptionsChange = event => {
    const field = event.target.id;
    this.state.volunteer[field] = event.target.value
    this.state.hasChanges = true;
    this.setState(this.state);
  }

  onHide = _ => {
    //TODO: check if there are unsaved changes and show "are you sure" alert
    this.props.onHide()
  }

  errorMessage = _ => {
    if (!this.state.volunteer.validProfile) {
      return (
        <Alert className="profile-alert" bsStyle="danger">
          <big><strong>{this.state.volunteer.userId}</strong> isn't a valid Midburn Profile.</big><br/>
          1. Ask the volunteer to create a Midburn Profile in the profiles system.<br/>
          2. The volunteer might need to accept the Terms of Service, ask to volunteer to login to the profiles system and accept.<br/>
          Link to profiles system - <u>https://profile.midburn.org/</u>
        </Alert>
      )
    }
    if (this.state.volunteer.needToFillGeneralForm) {
      return (
        <Alert className="profile-alert" bsStyle="warning">
          <big><strong>{this.state.volunteer.userId}</strong> hasn't filled the general form.</big><br/>
          Ask the volunteer to send a new join request, then accept the request and delete the old and invalid volunteer.
        </Alert>
      )
    }
    if (this.state.volunteer.needToRefillGeneralForm) {
      return (
        <Alert className="profile-alert" bsStyle="warning">
          <big><strong>{this.state.volunteer.userId}</strong> has filled an old general form.</big><br/>
          Ask the volunteer to send a new join request. after that you can delete the request.
        </Alert>
      )
    }
    return null;
  }

  save = _ => {
    this.state.isButtonEnabled = false
    axios.put(`/api/v1/departments/${this.props.volunteer.departmentId}/volunteer/${this.props.volunteer._id}`, {
        permission: this.state.volunteer.permission,
        yearly: this.state.volunteer.yearly === 'true' ? true : false,
    })
    .then(response => {
        this.state.isButtonEnabled = true
        this.state.hasChanges = false
        this.setState(this.state)
        this.props.onSuccess() 
    })
  }

  remove = _ => {
    //TODO: show "are you sure" alert
    this.state.isButtonEnabled = false
    axios.delete(`/api/v1/departments/${this.props.volunteer.departmentId}/volunteer/${this.props.volunteer._id}`)
    .then(response => {
        this.state.isButtonEnabled = true
        this.state.hasChanges = false
        this.setState(this.state)
        this.props.onSuccess()
        this.props.onHide() 
    })
  }

  render() {
    const name = this.props.volunteer ? 
                  `${this.props.volunteer.firstName} ${this.props.volunteer.lastName}` :
                  'No Data'
    const email = this.props.volunteer ? this.props.volunteer.userId : 'No Data'
    const errorMessage = this.errorMessage();

    return (
      <Modal show={this.props.show} onHide={this.onHide} onEnter={this.onEnter} bsSize="lg">
        <Modal.Header closeButton>
          <span className="edit-volunteer-title">
            <h2>{name}</h2>
            <h4>{email}</h4>
          </span>
          {this.state.hasChanges &&
          <Button className="edit-volunteer-save" bsStyle="success" onClick={this.save}>Save</Button>}
        </Modal.Header>
        <Modal.Body>
          {errorMessage}
          <div className="edit-volunteer-options">
            <FormGroup className="edit-volunteer-form-group" controlId="permission">
              <ControlLabel>Role</ControlLabel>
              <FormControl componentClass="select" onChange={this.handleOptionsChange} value={this.state.volunteer.permission}>
                <option value='manager'>Manager</option>
                <option value='volunteer'>Volunteer</option>
              </FormControl>
              <HelpBlock>Managers can edit the department info and add volunteers</HelpBlock>
            </FormGroup>
            <FormGroup className="edit-volunteer-form-group" controlId="yearly">
              <ControlLabel>Yearly Volunteer</ControlLabel>
              <FormControl componentClass="select" onChange={this.handleOptionsChange} value={this.state.volunteer.yearly}>
                <option value='true'>Yes</option>
                <option value='false'>No</option>
              </FormControl>
              <HelpBlock>Yearly volunteers are production volunteers</HelpBlock>
            </FormGroup>
          </div>
          <Button className="edit-volunteer-delete" bsStyle="danger" onClick={this.remove}>Remove</Button>
        </Modal.Body>
      </Modal>
    )
  }
}