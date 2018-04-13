import React from 'react';
import {Modal, Tab, Tabs, Button, Alert, FormGroup, ControlLabel, FormControl, HelpBlock} from 'react-bootstrap';
import axios from 'axios';
import FromAnswersView from './FormAnswersView';

require('./VolunteerRequestPreviewModal.scss')

export default class VolunteerRequestPreviewModal extends React.Component {
  constructor(props) {
      super(props);
      this.initState();
  }

  initState = _ => {
    this.state = {
      loading: true,
      request: this.props.request,
      status: '',

      generalAnswer: null,
      departmentAnswer: null,

      removeEnabled: true,

      permission: 'volunteer',
      yearly: 'false',
      addEnabled: true
    }
  }

  onEnter = _ => {
    this.initState();
    this.setState(this.state);
    this.fetchData();
  }

  fetchData = _ => {
    const departmentId = this.props.request.departmentId;
    const eventId = this.props.request.eventId;
    const userId = this.props.request.userId;
    Promise.all([
      axios.get(`/api/v1/form/events/${eventId}/answer/${userId}`).then(res => res.data),
      axios.get(`/api/v1/departments/${departmentId}/forms/events/${eventId}/answer/${userId}`).then(res => res.data)
    ]).then(([generalAnswer, departmentAnswer]) => {
      this.setState({
        ...this.state,
        generalAnswer: generalAnswer && generalAnswer.form ? generalAnswer.form : [],
        departmentAnswer: departmentAnswer && departmentAnswer.form ? departmentAnswer.form : [],
        loading: false
      })
    })
  }

  errorMessage = _ => {
    if (!this.state.request) return null;
    if (!this.state.request.sparkInfo || !this.state.request.sparkInfo.validProfile) {
      return (
        <Alert className="profile-alert" bsStyle="danger">
          <big><strong>{this.state.request.userId}</strong> isn't a valid Midburn Profile.</big><br/>
          1. Ask the volunteer to create a Midburn Profile in the profiles system.<br/>
          2. The volunteer might need to accept the Terms of Service, ask to volunteer to login to the profiles system and accept.<br/>
          3. The profiles system is slow - try to refresh the page<br/>
          Link to profiles system - <u>https://profile.midburn.org/</u>
        </Alert>
      )
    }
    if (this.state.request.needToFillGeneralForm) {
      return (
        <Alert className="profile-alert" bsStyle="warning">
          <big><strong>{this.state.request.userId}</strong> hasn't filled the general form.</big><br/>
          Ask the volunteer to send a new join request. It won't add a new request just fill the missing details for this request.
        </Alert>
      )
    }
    if (this.state.request.needToRefillGeneralForm) {
      return (
        <Alert className="profile-alert" bsStyle="warning">
          <big><strong>{this.state.request.userId}</strong> has filled an old general form.</big><br/>
          Ask the volunteer to send a new join request. It won't add a new request just fill the missing details for this request.
        </Alert>
      )
    }
    return null;
  }

  handleOptionsChange = event => {
    const field = event.target.id;
    this.state[field] = event.target.value
    this.setState(this.state);
  }

  onHide = _ => {
    //TODO: check if there are unsaved changes and show "are you sure" alert
    this.props.onHide()
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
    this.state.removeEnabled = false
    this.setState(this.state)

    const request = this.state.request;
    axios.delete(`/api/v1/departments/${request.departmentId}/events/${request.eventId}/request/${request.userId}`)
    .then(response => {
        this.state.removeEnabled = true
        this.setState(this.state)
        this.props.onSuccess()
        this.props.onHide()
    })
  }

  add = _ => {
    this.state.status = 'Adding... '
    this.state.addEnabled = false
    this.setState(this.state)
    const request = this.state.request;
    axios.post(`/api/v1/departments/${request.departmentId}/events/${request.eventId}/volunteer`, {
        permission: this.state.permission,
        yearly: this.state.yearly === 'true' ? true : false,
        userId: request.userId,
        contactEmail: request.contactEmail,
        contactPhone: request.contactPhone
    })
    .then(response => {
      this.state.addEnabled = true
      this.setState(this.state)
      this.props.onSuccess()
      this.props.onHide()
    })
    .catch(error => {
      this.state.status = error.response.data && error.response.data.error ? error.response.data.error : 'Server Error'
      this.state.addEnabled = true
      this.setState(this.state)
    });
  }

    formatingUserDetails = val => {
    return val? val: ''
  }

  renderUserDetails = _=> {
    if (!this.props.volunteer){
      return (
        <span className="edit-volunteer-title">
          No Data
        </span>
        )
    }
    let {firstName, lastName, contactEmail, email, contactPhone, tags} = this.props.volunteer;

    if (!tags || tags.length==0){ tags='No Tags'}
    else{
      let tagList = tags.map((tag, index) => {
        return <li key={index}>{tag}</li>
      })
      tags = <ul>{tagList}</ul>
    }

    return (
      <span className="edit-volunteer-title">
        <h2>{`${firstName} ${lastName}`}</h2>
        <h4>{email}</h4>
        <h5>{`${(this.formatingUserDetails(contactEmail))} , ${this.formatingUserDetails(contactPhone)}`}<br/>
          tags: {tags}

        </h5>
      </span>
    )
  }

  render() {
    if (!this.props.request) {
      return (<span/>)
    }

    const errorMessage = this.errorMessage();


    return (
      <Modal show={this.props.show} onHide={this.onHide} onEnter={this.onEnter} bsSize="lg">
        <Modal.Header closeButton>
          {this.renderUserDetails()}
          {/* {this.state.hasChanges &&
          <Button className="edit-volunteer-save" bsStyle="success" onClick={this.save}>Save</Button>} */}
        </Modal.Header>
        <Modal.Body>
          <Tabs id="edit-department-tabs">

            <Tab eventKey={1} title="Status" className="status">
              {errorMessage}
              <div className="add-section">
                <FormGroup className="add-volunteer-form-group" controlId="permission">
                  <ControlLabel>Role</ControlLabel>
                  <FormControl componentClass="select" onChange ={this.handleOptionsChange} value={this.state.permission}>
                    <option value='manager'>Manager</option>
                    <option value='volunteer'>Volunteer</option>
                  </FormControl>
                  <HelpBlock>Managers can edit the department info and add volunteers</HelpBlock>
                </FormGroup>
                <FormGroup className="add-volunteer-form-group" controlId="yearly">
                  <ControlLabel>Yearly Volunteer</ControlLabel>
                  <FormControl componentClass="select" onChange = {this.handleOptionsChange} value={this.state.yearly}>
                    <option value='true'>Yes</option>
                    <option value='false'>No</option>
                  </FormControl>
                  <HelpBlock>Yearly volunteers are production volunteers</HelpBlock>
                </FormGroup>
                <div>
                  <Button className="add-button" bsStyle="success" disabled={!this.state.addEnabled} onClick={this.add}>Add as volunteer</Button>
                  {this.state.status.length > 0 &&
                    <div className="add-error">{this.state.status}</div>}
                </div>
              </div>

              <Button bsStyle="danger" disabled={!this.state.removeEnabled} onClick={this.remove}>Remove</Button>
            </Tab>

            <Tab eventKey={2} title="Forms">
              <h4>General</h4>
                <FromAnswersView answers={this.state.generalAnswer}/>
              <h4>Department</h4>
                <FromAnswersView answers={this.state.departmentAnswer}/>
            </Tab>
          </Tabs>
          {/* <Button className="edit-volunteer-delete" bsStyle="danger" onClick={this.remove}>Remove</Button> */}
        </Modal.Body>
      </Modal>
    )
  }
}