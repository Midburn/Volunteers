import React, {Component} from 'react';
// import axios from 'axios';
import {Modal, Image, Tabs, Tab ,Button,
  Form, FormGroup, FormControl, ControlLabel, HelpBlock, Checkbox} from 'react-bootstrap'
require('./EditDepartment.css')
import * as Permissions from "../../model/permissionsUtils"
import * as Consts from '../../model/consts'
import JoinFormPreview from './JoinFormPreview';

export default class EditDepartment extends Component {
    constructor(props) {
        super(props);
        this.onEnter();
    }

  onEnter = _ => {
    this.state = { 
      department: {
        _id: '',
        basicInfo: {
          nameEn: '',
          nameHe: '',
          descriptionEn: '',
          descriptionHe: '',
          imageUrl: ''
        },
        status: {
          active: true,
          visibleToJoin: true,
          availableToJoin: true
        },
        requestForm: [],
        tags: []
      },
      showPreview: false,
      hasChanges:false
    };
    if (this.props.department) {
      this.state.department = this.props.department;
      this.updateStatusRules()
    }
    this.setState(this.state);
  }

  updateStatusRules = _ => {
    const status = this.state.department.status;
    if (!status.active) {
      status.visibleToJoin = false;
      status.availableToJoin = false;
    } else if (!status.visibleToJoin) {
      status.availableToJoin = false; 
    }
  }

  handleBasicInfoChange = event => {
    const basicInfo =  this.state.department.basicInfo;
    basicInfo[event.target.id] = event.target.value;
    
    this.state.hasChanges = true;
    this.setState(this.state);
  }

  handleStatusChange = key => _ => {
    const status = this.state.department.status
    status[key] = !status[key]
    this.updateStatusRules()
    
    this.state.hasChanges = true;
    this.setState(this.state);
  }

  handleQuestionChange = event => {
    const id = event.target.id;
    const requestForm = this.state.department.requestForm;
    if (id.startsWith('question-')) {
      const index = parseInt(id.substring(9));
      requestForm[index].question = event.target.value;
    } else if (id.startsWith('type-')) {
      const index = parseInt(id.substring(5));
      requestForm[index].questionType = event.target.value;
    }
    
    this.state.hasChanges = true;
    this.setState(this.state);
  }

  handleOptionsChanged = event => {
    const id = event.target.id;
    const index = parseInt(id.substring(8));
    const requestForm = this.state.department.requestForm;
    const options = []
    requestForm[index].options = event.target.value.split(',');
    
    this.state.hasChanges = true;
    this.setState(this.state);
  }

  addQuestion = _ => {
    const requestForm = this.state.department.requestForm;
    requestForm.push({
      question: '',
      questionType: 'text',
      options: []
    });
    this.state.hasChanges = true;
    this.setState(this.state);
  }

  deleteQuestion = event => {
    const index = event.target.id;
    const requestForm = this.state.department.requestForm;
    requestForm.splice(index, 1);
    this.state.hasChanges = true;
    this.setState(this.state);
  }

  showPreview = _ => {
    this.state.showPreview = true;
    this.setState(this.state);
  }
  hidePreview = _ => {
    this.state.showPreview = false;
    this.setState(this.state);
  }

  save = _ => {
    if (this.state.department._id) { // Edit
      axios.put(`/api/v1/departments/${this.state.department._id}`, this.state.department)
      .then(res => {
        this.state.department = res.data;
        this.state.hasChanges = false;
        this.setState(this.state);
      })
    } else { // Add
      axios.post("/api/v1/departments", this.state.department)
      .then(res => {
        this.state.department = res.data;
        this.state.hasChanges = false;
        this.setState(this.state);
      })
    }
  }

  delete = _ => {
    //TODO: show "are you sure" alert
    axios.delete(`/api/v1/departments/${this.state.department._id}`)
    .then(res => {
      this.props.onHide();
    })
  }

  onHide = _ => {
    //TODO: check if there are unsaved changes and show "are you sure" alert
    this.props.onHide();
  }
    
  render() {
    const basicInfo = this.state.department.basicInfo;
    const departmentLogo = basicInfo.imageUrl ? basicInfo.imageUrl : Consts.DEFAULT_LOGO;
    const questions = this.state.department.requestForm;
    const status = this.state.department.status;

    return (
      <Modal show={this.props.show} onHide={this.onHide} onEnter={this.onEnter} bsSize="lg">
        <Modal.Header closeButton>
          <Modal.Title>
          <Image src={departmentLogo} className="edit-department-department-logo"></Image>
          <span className="edit-department-title">{this.state.department._id ? 'Edit' : 'Add'} Department</span>
          {this.state.hasChanges &&
          <Button className="edit-department-save" bsStyle="success" 
                  onClick={this.save}>Save</Button>}
        </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs id="edit-department-tabs">

            <Tab eventKey={1} title="Basic Info">
              <FormGroup controlId="nameEn" style={{marginTop: 20}}>
                <ControlLabel>Name (English)</ControlLabel>
                <FormControl type="text" value={basicInfo.nameEn} onChange={this.handleBasicInfoChange}/>
              </FormGroup>
              <FormGroup controlId="nameHe">
                <ControlLabel>Name (Hebrew)</ControlLabel>
                <FormControl type="text" value={basicInfo.nameHe} onChange={this.handleBasicInfoChange}/>
              </FormGroup>
              <FormGroup controlId="descriptionEn">
                <ControlLabel>Description (English)</ControlLabel>
                <FormControl componentClass="textarea" value={basicInfo.descriptionEn} onChange={this.handleBasicInfoChange}/>
              </FormGroup>
              <FormGroup controlId="descriptionHe">
                <ControlLabel>Description (Hebrew)</ControlLabel>
                <FormControl componentClass="textarea" value={basicInfo.descriptionHe} onChange={this.handleBasicInfoChange}/>
              </FormGroup>
              <FormGroup controlId="imageUrl">
                <ControlLabel>Logo URL</ControlLabel>
                <FormControl type="text" value={basicInfo.imageUrl} onChange={this.handleBasicInfoChange}/>
                <HelpBlock>If you want to upload an image just use one of the free tools, like <a href="https://imgbb.com/">https://imgbb.com/</a></HelpBlock>
              </FormGroup>
            </Tab>
      
            <Tab eventKey={2} title="Status">
                <Checkbox inline className="edit-department-status-checkbox" checked={status.active}
                          onChange={this.handleStatusChange('active')}>
                  <b>Active</b>
                </Checkbox>
                <HelpBlock>Inactive departments won't appear anywhere. There's no way to see or edit the volunteer list.</HelpBlock>
                <Checkbox inline className="edit-department-status-checkbox" checked={status.visibleToJoin}
                          disabled={!status.active} onChange={this.handleStatusChange('visibleToJoin')}>
                  <b>Visible to new volunteers</b>
                </Checkbox>
                <HelpBlock>New volunteers will see this department in the "Join Us" page.</HelpBlock>
                <Checkbox inline className="edit-department-status-checkbox" checked={status.availableToJoin}
                          disabled={!status.active || !status.visibleToJoin} onChange={this.handleStatusChange('availableToJoin')}>
                  <b>Opened to new volunteers</b>
                </Checkbox>
                <HelpBlock>New volunteers can fill the join form. You should close it if you're not ready yet or already full.</HelpBlock>
                {this.state.department._id && Permissions.isAdmin() &&
                  <Button className="edit-department-delete" bsStyle="danger" onClick={this.delete}>Delete</Button>}
            </Tab>

            <Tab eventKey={3} title="Join Form" onEnter={this.hidePreview}>
              {this.state.showPreview ? (
                <div style={{marginTop: 20}}>
                  <Button bsStyle="link" className="edit-department-preview"
                          onClick={this.hidePreview}>Back</Button>
                  <JoinFormPreview questions={this.state.department.requestForm}/>
                </div>
                ) : ( 
                <div style={{marginTop: 20}}>
                  <HelpBlock>
                    Please write each question in both Hebrew and English.
                    <Button bsStyle="link" className="edit-department-preview"
                            onClick={this.showPreview}>Preview</Button>
                  </HelpBlock>
                  {questions.map((question, index) =>
                    <div key={index.toString()}>
                      <FormGroup controlId={`question-${index}`}>
                          <ControlLabel>
                            <span className="edit-department-question">Question {index+1}</span>
                            <Button bsStyle="link" className="edit-department-question-delete" 
                                    id={index} onClick={this.deleteQuestion}>Delete</Button>
                          </ControlLabel>
                          <FormControl componentClass="textarea" placeholder="What's Your Favorite Color?   ?מה הצבע המועדף עליך"
                                      value={question.question} onChange={this.handleQuestionChange}/>
                      </FormGroup>
                      <FormGroup controlId={`type-${index}`}>
                        <ControlLabel>Answer Type:</ControlLabel>
                        <FormControl componentClass="select" placeholder="Type" 
                                    value={question.questionType} onChange={this.handleQuestionChange}>
                          <option value='text'>Text</option>
                          <option value='textarea'>Text Area</option>
                          <option value='checkbox'>Checkbox</option>
                          <option value='radio'>Selection</option>
                          <option value='checkboxes'>Multiple Selection</option>
                        </FormControl>
                      </FormGroup>
                      {(question.questionType === 'radio' || question.questionType === 'checkboxes') &&(
                        <FormGroup controlId={`options-${index}`} style={{marginTop: 20}}>
                          <ControlLabel>Options:</ControlLabel>
                          <FormControl type="text" placeholder="Banana - בננה, Apple - תפוח, Avocado - אבוקדו"
                                      value={question.options.join()} onChange={this.handleOptionsChanged}/>
                          <HelpBlock>Please use comma separated options.</HelpBlock>
                        </FormGroup>
                      )}
                      <div className="edit-department-question-seperator"></div>
                    </div>
                  )}
                  <Button bsStyle="primary" onClick={this.addQuestion}>Add Question</Button>
                </div>
              )}
            </Tab>

          </Tabs>
        </Modal.Body>
      </Modal>
    );
  }
}
