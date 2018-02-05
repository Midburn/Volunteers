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
} from 'react-bootstrap'
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
    tags: []
};

export default class EditDepartment extends Component {
    constructor(props) {
        super(props);

        this.state = {
            department: props.department || defaultDepartment,
            departmentForm: [],
            hasChanges: false
        };

        this.handleOnSave = this.handleOnSave.bind(this);
        this.handleOnDepartmentFormSave = this.handleOnDepartmentFormSave.bind(this);
        this.handleOnStatusChange = this.handleOnStatusChange.bind(this);
    }

    componentDidMount() {
        if (!this.state.department._id) return;

        axios.get(`/api/v1/public/departments/${this.state.department._id}/forms`)
            .then(res => this.setState({departmentForm: res.data}));
    }

    handleBasicInfoChange = event => {
        const basicInfo = this.state.department.basicInfo;
        basicInfo[event.target.id] = event.target.value;

        this.state.hasChanges = true;
        this.setState(this.state);
    }

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
        const {department, departmentForm, hasChanges} = this.state;
        const {basicInfo, status} = department;
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
                            {this.state.department._id && Permissions.isAdmin() &&
                            <Button className="edit-department-delete" bsStyle="danger"
                                    onClick={this.delete}>Delete</Button>}
                        </Tab>

                        {department._id && <Tab eventKey={3} title="Join Form">
                            <FormManager questions={departmentForm} onSave={this.handleOnDepartmentFormSave}/>
                        </Tab>}
                    </Tabs>
                </Modal.Body>
            </Modal>
        );
    }
}
