import React, {Component} from 'react';
import axios from 'axios';
import {Button, FormControl, Image, ListGroup, ListGroupItem, Modal} from 'react-bootstrap'
import * as Permissions from "../../model/permissionsUtils"
import {DEFAULT_LOGO} from '../../model/consts'
import EditDepartment from './EditDepartment';
import FormManager from "../FormManager/FormManager";

require('./AdminView.css');

export default class AdminView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            departments: [],
            selectedDepartmentId: null,
            addDepartment: false,
            admins: [],
            showAddAdminModal: false,
            newAdminEmailInput: null,
            generalForm: [],
            generalFormVersion: 0
        };

        this.handleOnFormSave = this.handleOnFormSave.bind(this);
        this.handleOnDepartmentSelect = this.handleOnDepartmentSelect.bind(this);
        this.handleOnDepartmentModalHide = this.handleOnDepartmentModalHide.bind(this);
        this.handleAddDepartment = this.handleAddDepartment.bind(this);
    }

    refreshData() {
        axios.get("/api/v1/public/departments")
            .then(res => this.setState({departments: res.data}));
        axios.get("/api/v1/permissions/admins")
            .then(res => this.setState({admins: res.data}));
        axios.get("/api/v1/public/form")
            .then(res => this.setState({generalForm: res.data, generalFormVersion: this.state.generalFormVersion+1}));
    };

    handleAddDepartment() {
        this.setState({addDepartment: true});
    };

    handleOnDepartmentSelect(departmentId) {
        this.setState({selectedDepartmentId: departmentId});
    }

    handleOnDepartmentModalHide() {
        this.setState({selectedDepartmentId: null, addDepartment: false});
        this.refreshData();
    };

    showAddAdmin = _ => {
        this.state.showAddAdminModal = true;
        this.setState(this.state);
    };

    addAdmin = _ => {
        axios.post("/api/v1/permissions/admins", {userId: this.state.newAdminEmailInput.value})
            .then(res => {
                this.state.newAdminEmailInput.value = '';
                this.state.showAddAdminModal = false;
                this.setState(this.state);
                this.refreshData();
            })
    };

    hideAddAdmin = _ => {
        this.state.showAddAdminModal = false;
        this.setState(this.state);
    };

    handleOnFormSave(form) {
        axios.post("/api/v1/form", {form})
            .then(res => this.setState({generalForm: res.data, generalFormVersion: this.state.generalFormVersion+1}))
    }

    componentDidMount() {
        this.refreshData();
    };

    statusStr = department => {
        if (!department.status.active) {
            return 'Inactive'
        }
        if (!department.status.visibleToJoin) {
            return 'Hidden'
        }
        if (!department.status.availableToJoin) {
            return 'Closed'
        }
        return 'Open'
    }

    render() {
        const {departments, generalForm, generalFormVersion, selectedDepartmentId, addDepartment} = this.state;

        const selectedDepartment =
            selectedDepartmentId &&
            departments.find(department => department._id === selectedDepartmentId);

        return (
            <div className="admin-view">
                {(selectedDepartment || addDepartment) &&
                <EditDepartment onHide={this.handleOnDepartmentModalHide}
                                department={selectedDepartment}
                />}
                <div className="card container">
                    <h1 className="admin-departments">Departments</h1>
                    {Permissions.isAdmin() &&
                    <Button bsStyle="primary" className="admin-add-button" onClick={this.handleAddDepartment}>
                        Add Department
                    </Button>}
                    <ListGroup className="admin-department-list">
                        {departments.map(department => {
                            const basicInfo = department.basicInfo;
                            const departmentLogo = basicInfo.imageUrl ? basicInfo.imageUrl : DEFAULT_LOGO;
                            const active = department.status.active;
                            const statusStr = this.statusStr(department);
                            return (
                                <ListGroupItem key={department._id} style={{minHeight: 80}}>
                                    <div className="admin-department-line">
                                        <div className="admin-department-line-left">
                                            <Image src={departmentLogo} className="admin-department-logo"/>
                                            <div>
                                                <h4 className={`admin-title ${!active ? 'admin-title-inactive' : ''}`}>{basicInfo.nameEn} - {basicInfo.nameHe}</h4>
                                                {(Permissions.isAdmin() || Permissions.isManagerOfDepartment(department._id)) &&
                                                <Button bsStyle="link" className="admin-edit-button"
                                                        onClick={() =>
                                                            this.handleOnDepartmentSelect(department._id)}>Edit
                                                </Button>}
                                            </div>
                                        </div>
                                        <div className={`admin-department-line-right ${statusStr}`}>{statusStr}</div>
                                    </div>
                                </ListGroupItem>
                            )
                        })}
                    </ListGroup>
                </div>


                <div className="card container">
                    <h1 className="admin-departments">Reports</h1>
                    {Permissions.isAdmin() && <div className="admin-report">
                        <a href={`/api/v1/reports/allShiftsHours`}>Volunteers Hours</a>
                        <span className="admin-report-comment"> - Volunteering hours from all the shifts</span>
                    </div>}

                </div>

                {Permissions.isAdmin() &&
                <div className="card container">
                    <h1 className="admin-departments">Admins</h1>
                    {Permissions.isAdmin() &&
                    <Button bsStyle="primary" className="admin-add-button" onClick={this.showAddAdmin}>Add
                        Admin</Button>}
                    <ListGroup className="admin-department-list">
                        {this.state.admins.map(admin => {
                            const adminTitle = admin.firstName ? `${admin.firstName} ${admin.lastName}` : "N/A";
                            const adminEmail = admin.userId;
                            return (
                                <ListGroupItem key={admin._id} header={adminTitle}>{adminEmail}</ListGroupItem>
                            )
                        })}
                    </ListGroup>
                </div>
                }

                {Permissions.isAdmin() &&
                <div className="card container">
                    <FormManager showPreview
                                 questions={generalForm}
                                 version={generalFormVersion}
                                 onSave={this.handleOnFormSave}
                    />
                </div>
                }

                <Modal show={this.state.showAddAdminModal}>
                    <Modal.Header><Modal.Title>Add Admin</Modal.Title></Modal.Header>
                    <Modal.Body>
                        <FormControl inputRef={input => this.state.newAdminEmailInput = input} type="text"
                                     placeholder="Enter email"/>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.hideAddAdmin}>Close</Button>
                        <Button bsStyle="primary" onClick={this.addAdmin}>Add</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}
