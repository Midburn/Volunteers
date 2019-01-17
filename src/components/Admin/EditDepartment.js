import React, {Component} from 'react';
import axios from 'axios';
import {
    Button,
    Checkbox,
    ControlLabel,
    FormControl,
    FormGroup,
    HelpBlock,
    Image,
    Modal,
    Tab,
    Tabs
} from 'react-bootstrap';
import * as Permissions from "../../model/permissionsUtils";
import FormManager from "../FormManager/FormManager";

require('./EditDepartment.css');

const DEFAULT_LOGO = 'https://yt3.ggpht.com/-t7buXM4UqEc/AAAAAAAAAAI/AAAAAAAAAAA/n5U37nYuExw/s900-c-k-no-mo-rj-c0xffffff/photo.jpg';

const defaultDepartment = {
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
    tags: [],
    allocationsDetails:
        {
            maxAllocatedTickets: 0,
            maxAllocatedEarlyEntrancesPhase1: 0,
            maxAllocatedEarlyEntrancesPhase2: 0,
            maxAllocatedEarlyEntrancesPhase3: 0
        }
};

export default class EditDepartment extends Component {
    constructor(props) {
        super(props);

        this.state = {
            department: props.department || defaultDepartment,
            departmentForm: [],
            volunteersAllocations: {},
            hasChanges: false
        };

        this.handleOnSave = this.handleOnSave.bind(this);
        this.handleOnDepartmentFormSave = this.handleOnDepartmentFormSave.bind(this);
        this.handleOnStatusChange = this.handleOnStatusChange.bind(this);
        this.handleOnAllocationsDetailsChange = this.hasOwnProperty.bind(this);
    }

    componentDidMount() {
        if (!this.state.department._id) return;

        axios.get(`/api/v1/public/departments/${this.state.department._id}/forms`)
            .then(res => this.setState({departmentForm: res.data}));

        axios.get(`/api/v1/departments/${this.state.department._id}/volunteersAllocations`)
            .then(res => this.setState({volunteersAllocations: res.data}));
    }

    handleBasicInfoChange = event => {
        const basicInfo = this.state.department.basicInfo;
        basicInfo[event.target.id] = event.target.value;

        this.state.hasChanges = true;
        this.setState(this.state);
    };

    handleOnAllocatedTicketsChange = event => {
        const allocationsDetails = this.state.department.allocationsDetails;
      
        if(event.target.value >= 0) {
            allocationsDetails[event.target.id] = event.target.value;
            console.log("alocated tickets for phase: ", event.target.id.slice(-1) , " are: ",allocationsDetails[event.target.id]);
            this.state.hasChanges = true;
            this.setState(this.state);
        }
    };

    handleOnStatusChange(key) {
        const status = {...this.state.department.status};
        status[key] = !status[key];

        if (!status.active) {
            status.visibleToJoin = false;
            status.availableToJoin = false;
        } else if (!status.visibleToJoin) {
            status.availableToJoin = false;
        }

        this.setState({hasChanges: true, department: {...this.state.department, status}});
    }

    // handleOnAllocationsDetailsChange(key, value) {
    //     console.log("key=" + key, ",value=" + value);
    //     const allocationsDetails = {...this.state.department.allocationsDetails};
    //     console.log(JSON.stringify(allocationsDetails));
    //     allocationsDetails[key] = value;
    //
    //     this.setState({hasChanges: true, department: {...this.state.department, allocationsDetails}});
    // }

    handleOnSave() {
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

    handleOnDepartmentFormSave(form) {
        axios.post(`/api/v1/departments/${this.state.department._id}/forms`, {form})
            .then(res => this.setState({departmentForm: res.data}));
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
        const {department, volunteersAllocations, departmentForm, hasChanges} = this.state;
        const {basicInfo, status, allocationsDetails} = department;
        const departmentLogo = basicInfo.imageUrl ? basicInfo.imageUrl : DEFAULT_LOGO;

        return (
            <Modal show={true} onHide={this.onHide} onEnter={this.onEnter} bsSize="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <Image src={departmentLogo} className="edit-department-department-logo"/>
                        <span
                            className="edit-department-title">{department._id ? 'Edit' : 'Add'} Department</span>
                        {hasChanges &&
                        <Button className="edit-department-save" bsStyle="success"
                                onClick={this.handleOnSave}>Save</Button>}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Tabs id="edit-department-tabs">
                        <Tab eventKey={1} title="Basic Info">
                            <FormGroup controlId="nameEn" style={{marginTop: 20}}>
                                <ControlLabel>Name (English)</ControlLabel>
                                <FormControl type="text"
                                             value={basicInfo.nameEn}
                                             onChange={this.handleBasicInfoChange}/>
                            </FormGroup>
                            <FormGroup controlId="nameHe">
                                <ControlLabel>Name (Hebrew)</ControlLabel>
                                <FormControl type="text"
                                             value={basicInfo.nameHe}
                                             onChange={this.handleBasicInfoChange}/>
                            </FormGroup>
                            <FormGroup controlId="descriptionEn">
                                <ControlLabel>Description (English)</ControlLabel>
                                <FormControl componentClass="textarea"
                                             value={basicInfo.descriptionEn}
                                             onChange={this.handleBasicInfoChange}/>
                            </FormGroup>
                            <FormGroup controlId="descriptionHe">
                                <ControlLabel>Description (Hebrew)</ControlLabel>
                                <FormControl componentClass="textarea"
                                             value={basicInfo.descriptionHe}
                                             onChange={this.handleBasicInfoChange}/>
                            </FormGroup>
                            <FormGroup controlId="imageUrl">
                                <ControlLabel>Logo URL</ControlLabel>
                                <FormControl type="text" value={basicInfo.imageUrl}
                                             onChange={this.handleBasicInfoChange}/>
                                <HelpBlock>If you want to upload an image just use one of the free tools, like <a
                                    href="https://imgbb.com/">https://imgbb.com/</a></HelpBlock>
                            </FormGroup>
                        </Tab>

                        <Tab eventKey={2} title="Status">
                            <Checkbox inline className="edit-department-status-checkbox"
                                      checked={status.active}
                                      onChange={() => this.handleOnStatusChange('active')}>
                                <b>Active</b>
                            </Checkbox>
                            <HelpBlock>Inactive departments won't appear anywhere. There's no way to see or edit the
                                volunteer list.</HelpBlock>
                            <Checkbox inline className="edit-department-status-checkbox" checked={status.visibleToJoin}
                                      disabled={!status.active}
                                      onChange={() => this.handleOnStatusChange('visibleToJoin')}>
                                <b>Visible to new volunteers</b>
                            </Checkbox>
                            <HelpBlock>New volunteers will see this department in the "Join Us" page.</HelpBlock>
                            <Checkbox inline className="edit-department-status-checkbox"
                                      checked={status.availableToJoin}
                                      disabled={!status.active || !status.visibleToJoin}
                                      onChange={() => this.handleOnStatusChange('availableToJoin')}>
                                <b>Opened to new volunteers</b>
                            </Checkbox>

                            <HelpBlock>New volunteers can fill the join form. You should close it if you're not ready
                                yet or already full.</HelpBlock>
                            {this.state.department._id && (!this.state.department.status.visibleToJoin || !this.state.department.status.availableToJoin) &&
                            <HelpBlock><br/>Here's a <a href={`../volunteer-requests?departmentId=${this.state.department._id}`}
                                   target="_blank">
                                    secret link
                                </a> to join your department.
                                <br/>You can send this link to other volunteers in your department, and they will be able to send join requests even if the department is closed or hidden.
                                <br/>Don't publish this link!!! . Use carefully :)
                            </HelpBlock>}

                            {this.state.department._id && Permissions.isAdmin() &&
                            <Button className="edit-department-delete" bsStyle="danger"
                                    onClick={this.delete}>Delete</Button>}
                        </Tab>

                        <Tab eventKey={3} title="Tickets & Entrance">
                            <br/>
                            <FormGroup controlId="maxAllocatedTickets">
                                <ControlLabel># Tickets Allocations</ControlLabel>
                                <FormControl type="number" value={allocationsDetails.maxAllocatedTickets || 0}
                                             disabled={!Permissions.isAdmin()}
                                             onChange={this.handleOnAllocatedTicketsChange}/>
                                <HelpBlock>The number of tickets for split among volunteers from last MibBurn<br/>
                                    <b>{volunteersAllocations.allocatedTickets} entrance tickets</b> were already assigned to volunteers -  
                                    <b> {allocationsDetails.maxAllocatedTickets - volunteersAllocations.allocatedTickets}</b> left
                                </HelpBlock>
                            </FormGroup>
                            <br/>
                            <FormGroup controlId="maxAllocatedEarlyEntrancesPhase1">
                                <ControlLabel># Early Entrances 9.5.18</ControlLabel>
                                <FormControl type="number" value={allocationsDetails.maxAllocatedEarlyEntrancesPhase1 || 0}
                                             disabled={!Permissions.isAdmin()}
                                             onChange={this.handleOnAllocatedTicketsChange}/>
                                <HelpBlock>The number of volunteers for this department that can enter on 09/05/2018 - 09:00 or after<br/>
                                    <b>{volunteersAllocations.allocatedEarlyEntrancesPhase1} early entrance vouchers</b> were already assigned to volunteers -  
                                    <b> {allocationsDetails.maxAllocatedEarlyEntrancesPhase1 - volunteersAllocations.allocatedEarlyEntrancesPhase1}</b> left
                                </HelpBlock>
                            </FormGroup>
                            <br/>
                            <FormGroup controlId="maxAllocatedEarlyEntrancesPhase2">
                                <ControlLabel># Early Entrances 13.5.18</ControlLabel>
                                <FormControl type="number" value={allocationsDetails.maxAllocatedEarlyEntrancesPhase2 || 0}
                                             disabled={!Permissions.isAdmin()}
                                             onChange={this.handleOnAllocatedTicketsChange}/>
                                <HelpBlock>The number of volunteers for this department that can enter on 13/05/2018 - 14:00 or after.<br/>
                                    <b>{volunteersAllocations.allocatedEarlyEntrancesPhase2} early entrance vouchers</b> were already assigned to volunteers - 
                                    <b> {allocationsDetails.maxAllocatedEarlyEntrancesPhase2 - volunteersAllocations.allocatedEarlyEntrancesPhase2}</b> left
                                </HelpBlock>
                            </FormGroup>
                        </Tab>
                        {department._id && <Tab eventKey={4} title="Join Form">
                            <FormManager questions={departmentForm} onSave={this.handleOnDepartmentFormSave}/>
                        </Tab>}
                    </Tabs>
                </Modal.Body>
            </Modal>
        );
    }
}
