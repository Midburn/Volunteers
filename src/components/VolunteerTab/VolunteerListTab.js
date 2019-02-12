import React, {Component} from 'react';
import axios from 'axios';
import {Button, Dropdown, FormControl, Image, MenuItem, Table, Modal, Alert} from 'react-bootstrap'
import * as Permissions from "../../model/permissionsUtils"
import * as Consts from '../../model/consts'
import Select from 'react-select';
import Checkbox from 'react-checkbox';
import VolunteerAddModal from "./VolunteerAddModal"
import VolunteerEditModal from "./VolunteerEditModal"
import VolunteerRequestPreviewModal from "./VolunteerRequestPreviewModal"
import {CSVLink} from 'react-csv';
import TagFilter from "../TagFilter";

import './VolunteerListTab.scss';

function formatTag(tag) {
    const max = 5;
    if (tag.length <= max) return tag;

    return `${tag.slice(0, max)}..`;
}

export default class VolunteerListTab extends Component {

    constructor(props) {
        super(props);
        this.state = {
            volunteers: [],
            visibleVolunteers: [],
            requests: [],
            visibleRequests: [],
            numberOfRequests: 0,

            departments: [],

            filter: {
                search: '',
                departmentId: null,
                tags: new Set(),
                requestTags: new Set()
            },

            showAddModal: false,
            editModalVolunteer: '',
            editModalRequest: '',
            showTags: true,
            showRequestTags: true,
            maxAllocationReachedPhase1: false,
            maxAllocationReachedPhase2: false,
            successAlert: false,
            errorAlert: false
        };

        this.onTagsChange = this.onTagsChange.bind(this);
        this.onEarlyEntranceAllocatedChange = this.onEarlyEntranceAllocatedChange.bind(this);
        // this.onTicketsAllocatedChange = this.onTicketsAllocatedChange.bind(this);
        this.onVolunteerRequestTagsChange = this.onVolunteerRequestTagsChange.bind(this);
        this.handleOnTagFilterChange = this.handleOnTagFilterChange.bind(this);
        this.updateVisibleVolunteers = this.updateVisibleVolunteers.bind(this);
        this.handleOnShowTagToggle = this.handleOnShowTagToggle.bind(this);
        this.handleOnShowRequestTagToggle = this.handleOnShowRequestTagToggle.bind(this);
        this.handleOnRequestTagFilterChange = this.handleOnRequestTagFilterChange.bind(this);
        this.showEditModal = this.showEditModal.bind(this);
        this.updateAllocationMaxReached = this.updateAllocationMaxReached.bind(this);
        this.showSuccessAlert = this.showSuccessAlert.bind(this);
        this.hideSuccessAlert = this.hideSuccessAlert.bind(this);
        this.showErrorAlert = this.showErrorAlert.bind(this);
        this.hideErrorAlert = this.hideErrorAlert.bind(this);
    }

    componentWillMount() {
        this.fetchDepartments();
    }
 
    updateAllocationMaxReached(phase) {
        if(this.state.visibleVolunteers[0]){
            const  volunteer = this.state.visibleVolunteers[0]
            const maxAllocationByPhase = this.state.departments.find(d => d._id === volunteer.departmentId).allocationsDetails['maxAllocatedEarlyEntrancesPhase' + phase]
        
            let currentPhaseAllocation = this.state.visibleVolunteers.reduce((acc, volunteer)=> {
                if(volunteer['allocationsDetails']['allocatedEarlyEntrancePhase' + phase] === true) {
                    return acc + 1;
                }
                else return acc
            }, 0);
            
            currentPhaseAllocation >= maxAllocationByPhase ? this.state['maxAllocationReachedPhase' + phase] = true :  this.state['maxAllocationReachedPhase' + phase] = false;
            this.setState(this.state);
        }  
    }

    fetchDepartments = () => {
        axios.get("/api/v1/public/departments")
            .then(res => {
                const departments = res.data;
                this.state.departments = departments.filter(department =>
                    department.status.active &&
                    (Permissions.isAdmin() || Permissions.isManagerOfDepartment(department._id)));
                this.state.filter.departmentId = this.state.departments && this.state.departments[0]._id;
                this.setState(this.state);
                this.fetchVolunteers();
            })
    }

    fetchVolunteers = () => {
        this.state.volunteers = [];
        this.state.requests = [];
        this.state.numberOfRequests = this.state.departments.length * 2;
        this.setState(this.state);
        for (let i = 0; i < this.state.departments.length; i++) {
            const departmentId = this.state.departments[i]._id;
            axios.get(`/api/v1/departments/${departmentId}/volunteers`)
                .then(res => {
                    this.state.volunteers = this.state.volunteers.concat(res.data);
                    this.state.numberOfRequests--;
                    this.setState(this.state);
                    this.updateVisibleVolunteers();
                })
                .catch(_ => {
                    this.state.numberOfRequests--;
                    this.setState(this.state);
                });
            axios.get(`/api/v1/departments/${departmentId}/requests`)
                .then(res => {
                    this.state.requests = this.state.requests.concat(res.data);
                    this.state.numberOfRequests--;
                    this.setState(this.state);
                    this.updateVisibleVolunteers();
                })
                .catch(_ => {
                    this.state.numberOfRequests--;
                    this.setState(this.state);
                });
        }
    }

    updateVisibleVolunteers = _ => {
        const searchTerm = this.state.filter.search ? this.state.filter.search.toLowerCase().trim() : "";
        const isVisible = (volunteer, isRequest) => {
            if (this.state.filter.departmentId && this.state.filter.departmentId !== volunteer.departmentId) {
                return false;
            }
            if (searchTerm) {
                const match = volunteer.userId.toLowerCase().indexOf(searchTerm) > -1 ||
                    (volunteer.sparkInfo && volunteer.sparkInfo.firstName && volunteer.sparkInfo.firstName.toLowerCase().indexOf(searchTerm) > -1) ||
                    (volunteer.sparkInfo && volunteer.sparkInfo.lastName && volunteer.sparkInfo.lastName.toLowerCase().indexOf(searchTerm) > -1);
                if (!match) {
                    return false;
                }
            }

            const selectedTags = isRequest ? this.state.filter.requestTags : this.state.filter.tags;
            if (volunteer.tags && selectedTags.size !== 0) {
                const intersection = volunteer.tags.filter(tag => selectedTags.has(tag));
                if (intersection.length === 0) return false;
            }
            return true;
        };
        const compareVolunteers = (a, b) => {
            if (a.permission === 'manager' && b.permission !== 'manager') return -1;
            else if (a.permission !== 'manager' && b.permission === 'manager') return 1;

            let dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            let dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA
        };


        const visibleVolunteers = this.state.volunteers.filter(volunteer => isVisible(volunteer, false)).sort((a, b) => compareVolunteers(a, b));
        const visibleRequests = this.state.requests.filter(volunteer => isVisible(volunteer, true)).sort((a, b) => compareVolunteers(a, b));
        this.state.visibleVolunteers = visibleVolunteers;
        this.state.visibleRequests = visibleRequests;
        this.setState(this.state);

        this.updateAllocationMaxReached(1);        
        this.updateAllocationMaxReached(2);        
    }

    searchChanged = event => {
        this.state.filter.search = event.target.value;
        this.setState(this.state);
        this.updateVisibleVolunteers();
    };

    onSelectDepartment = (eventKey, event) => {
        if (eventKey === 'all') {
            this.state.filter.departmentId = '';
        } else {
            this.state.filter.departmentId = eventKey;
        }
        this.state.filter.tags = new Set();
        this.state.showTags = true;
        this.setState(this.state);
        this.updateVisibleVolunteers();
    }

    showAddModal = _ => {
        this.state.showAddModal = true;
        this.setState(this.state);
    }

    showEditModal(volunteerId) {
        this.state.editModalVolunteer = this.state.visibleVolunteers.find(volunteer => volunteer._id === volunteerId);
        this.setState(this.state);
    }

    showRequestModal(requestId) {
        this.state.editModalRequest = this.state.visibleRequests.find(request => request._id === requestId);
        this.setState(this.state);
    }

    hideModals = _ => {
        this.state.showAddModal = false;
        this.state.editModalVolunteer = null;
        this.state.editModalRequest = null;
        this.setState(this.state);
    }

    updateVolunteer(volunteer) {
        axios.put(`/api/v1/departments/${volunteer.departmentId}/volunteer/${volunteer._id}`, {
            permission: volunteer.permission,
            yearly: volunteer.yearly === 'true',
            tags: volunteer.tags,
            allocationsDetails: volunteer.allocationsDetails
        })
        .then(err => {
            this.showSuccessAlert();
        })
        .catch(err => {
            this.showErrorAlert();
        })
    }

    updateVolunteerRequest(volunteer) {
        axios.put(`/api/v1/departments/${volunteer.departmentId}/requests/${volunteer.userId}`, {
            tags: volunteer.tags
        });
    }

    showSuccessAlert = _ => {
        this.state.successAlert = true;
        this.setState(this.state);
    }
    hideSuccessAlert = _ => {
        this.state.successAlert = false;
        this.setState(this.state);
    }
    showErrorAlert = _ => {
        this.state.errorAlert = true;
        this.setState(this.state);
    }
    hideErrorAlert = _ => {
        this.state.errorAlert = false;
        this.setState(this.state);
    }

    onTagsChange(userId, tags) {
        const {visibleVolunteers} = this.state;
        const volunteer = visibleVolunteers.find(volunteer => volunteer.userId === userId);
        volunteer['tags'] = tags.map(tag => tag.value);

        this.setState({visibleVolunteers});
        this.updateVolunteer(volunteer);
    }

    onEarlyEntranceAllocatedChange(userId, allocatedEarlyEntrance, phase) {
        // console.log("new value for user id " + userId + ", phase " + phase + " is " + allocatedEarlyEntrance);
        
        const {visibleVolunteers} = this.state;
        const volunteer = visibleVolunteers.find(volunteer => volunteer.userId === userId);
        
        // console.log("volunteer before=" + JSON.stringify(volunteer));
        volunteer['allocationsDetails']['allocatedEarlyEntrancePhase' + phase] = allocatedEarlyEntrance;
        // console.log("volunteer after=" + JSON.stringify(volunteer));
        
        this.updateAllocationMaxReached(phase);

        this.setState({visibleVolunteers});
        this.updateVolunteer(volunteer);
    }

    // onTicketsAllocatedChange(userId, numAllocatedTickets) {
    //     console.log("new value for user id " + userId + "=" + numAllocatedTickets);
    //     const {visibleVolunteers} = this.state;
    //     const volunteer = visibleVolunteers.find(volunteer => volunteer.userId === userId);
    //     console.log("volunteer before=" + JSON.stringify(volunteer));
    //     volunteer['allocationsDetails']['allocatedTickets'] = numAllocatedTickets;
    //     console.log("volunteer after=" + JSON.stringify(volunteer));
    
    //     this.setState({visibleVolunteers});
    //     VolunteerListTab.updateVolunteer(volunteer);
    // }

    onVolunteerRequestTagsChange(userId, tags) {
        const {visibleRequests} = this.state;
        const volunteer = visibleRequests.find(volunteer => volunteer.userId === userId);
        volunteer['tags'] = tags.map(tag => tag.value);

        this.setState({visibleRequests});
        this.updateVolunteerRequest(volunteer);
    }

    handleOnTagFilterChange(event, option) {
        const selectedTags = this.state.filter.tags;
        if (event.target.checked) {
            selectedTags.add(option);
        } else {
            selectedTags.delete(option);
        }

        this.setState({filter: {...this.state.filter, tags: selectedTags}});
        this.updateVisibleVolunteers();
    }

    handleOnRequestTagFilterChange(event, option) {
        const selectedTags = this.state.filter.requestTags;
        if (event.target.checked) {
            selectedTags.add(option);
        } else {
            selectedTags.delete(option);
        }

        this.setState({filter: {...this.state.filter, requestTags: selectedTags}});
        this.updateVisibleVolunteers();
    }

    handleOnShowTagToggle(event) {
        this.setState(
            {showTags: event.target.checked, filter: {...this.state.filter, tags: new Set()}},
            this.updateVisibleVolunteers);
    }

    handleOnShowRequestTagToggle(event) {
        this.setState(
            {showRequestTags: event.target.checked, filter: {...this.state.filter, requestTags: new Set()}},
            this.updateVisibleVolunteers);
    }

    downloadVolunteers = _ => {
        const departmentName = this.state.filter.departmentId ? this.state.departments.find(d => d._id === this.state.filter.departmentId).basicInfo.nameEn : 'all';
        const filename = `${departmentName}-volunteers.csv`;
        const headers = ['Department', 'Midburn Profile', 'First Name', 'Last Name', 'Email', 'Phone', 'Role', 'Yearly', '#Tickets', 'Early Entrance 9.5', 'Early Entrance 13.5', 'Tags', 'Other Departments', 'Added Date'];
        const generalQuestions = [];
        const departmentQuestions = [];
        const data = this.state.visibleVolunteers.map(volunteer => {
            const volData = {
                Department: this.state.departments.find(d => d._id === volunteer.departmentId).basicInfo.nameEn,
                "Midburn Profile": volunteer.userId,
                "First Name": volunteer.sparkInfo && volunteer.sparkInfo.firstName ? volunteer.sparkInfo.firstName : 'No Data',
                "Last Name": volunteer.sparkInfo && volunteer.sparkInfo.lastName ? volunteer.sparkInfo.lastName : 'No Data',
                Email: volunteer.contactEmail ? volunteer.contactEmail : 'No Data',
                Phone: volunteer.contactPhone ? volunteer.contactPhone : 'No Data',
                "Added Date": volunteer.createdAt ? volunteer.createdAt.split('T')[0] : 'N/A',
                Role: volunteer.permission,
                Yearly: volunteer.yearly ? 'Yes' : 'No',
                "#Tickets": volunteer.sparkInfo && typeof volunteer.sparkInfo.numOfTickets !== 'undefined' ? volunteer.sparkInfo.numOfTickets : '',
                // "#Tickets Allocated": volunteer.allocationsDetails !== null ? volunteer.allocationsDetails.allocatedTickets : 0,
                "Early Entrance 9.5": volunteer.allocationsDetails !== null ? (volunteer.allocationsDetails.allocatedEarlyEntrancePhase1 ? 'Yes' : '') : '',
                "Early Entrance 13.5": volunteer.allocationsDetails !== null ? (volunteer.allocationsDetails.allocatedEarlyEntrancePhase2 ? 'Yes' : '') : '',
                // "Early Entrance Phase 3?": volunteer.allocationsDetails !== null ? volunteer.allocationsDetails.allocatedEarlyEntrancePhase3 : false,

                "Other Departments": volunteer.otherDepartments ? volunteer.otherDepartments.map(deptBasicInfo => deptBasicInfo.nameEn ? deptBasicInfo.nameEn : deptBasicInfo.nameHe).join() : '',
                Tags: volunteer.tags.join(", ")
            };
            if (volunteer.generalForm && volunteer.generalForm.form) {
                volunteer.generalForm.form.forEach(question => {
                    const que = question.question.replace(/\r?\n|\r|\n/g, '').replace('"','\'\'').replace(',', '.');
                    volData[que] = question.answer ? question.answer.replace(/\r?\n|\r/g, '').replace('"','\'\'').replace(',', '.') : '';
                    if (generalQuestions.indexOf(que) === -1) {
                        generalQuestions.push(que);
                    }
                })
            }

            if (!this.state.filter.departmentId) {
                // show department form data only for one department
                return volData;
            }
            if (volunteer.departmentForm && volunteer.departmentForm.form) {
                volunteer.departmentForm.form.forEach(question => {
                    const que = question.question.replace(/\r?\n|\r|\n/g, '').replace('"','\'\'').replace(',', '.');
                    volData[que] = question.answer ? question.answer.replace(/\r?\n|\r/g, '').replace('"','\'\'').replace(',', '.') : '';
                    if (departmentQuestions.indexOf(que) === -1) {
                        departmentQuestions.push(que);
                    }
                })
            }
            return volData;
        });
        return (
            <CSVLink headers={headers.concat(departmentQuestions).concat(generalQuestions)} data={data} target="_blank"
                     filename={filename}>
                <Button bsStyle="link">Download</Button>
            </CSVLink>
        )
    };

    downloadRequests = _ => {
        const departmentName = this.state.filter.departmentId ? this.state.departments.find(d => d._id === this.state.filter.departmentId).basicInfo.nameEn : 'all';
        const filename = `${departmentName}-requests.csv`
        const headers = ['Department', 'Midburn Profile', 'First Name', 'Last Name', 'Email', 'Phone', '#Tickets', 'Added Date', 'Tags'];
        const generalQuestions = [];
        const departmentQuestions = [];
        const data = this.state.visibleRequests.map(request => {
            const reqData = {
                Department: this.state.departments.find(d => d._id === request.departmentId).basicInfo.nameEn,
                "Midburn Profile": request.userId,
                "First Name": request.sparkInfo && request.sparkInfo.firstName ? request.sparkInfo.firstName : 'No Data',
                "Last Name": request.sparkInfo && request.sparkInfo.lastName ? request.sparkInfo.lastName : 'No Data',
                Email: request.contactEmail ? request.contactEmail : 'No Data',
                Phone: request.contactPhone ? request.contactPhone : 'No Data',
                "#Tickets": request.sparkInfo && typeof request.sparkInfo.numOfTickets !== 'undefined' ? request.sparkInfo.numOfTickets : '',
                "Added Date": request.createdAt ? request.createdAt.split('T')[0] : 'N/A',
                Tags: request.tags.join(", ")
            };
            if (request.generalForm && request.generalForm.form) {
                request.generalForm.form.forEach(question => {
                    const que = question.question.replace(/\r?\n|\r|\n/g, '').replace('"','\'\'').replace(',', '.');
                    reqData[que] = question.answer ? question.answer.replace(/\r?\n|\r/g, '').replace('"','\'\'').replace(',', '.') : '';
                    if (generalQuestions.indexOf(que) === -1) {
                        generalQuestions.push(que);
                    }
                })
            }

            if (!this.state.filter.departmentId) {
                // show department form data only for one department
                return reqData;
            }
            if (request.departmentForm && request.departmentForm.form) {
                request.departmentForm.form.forEach(question => {
                    const que = question.question.replace(/\r?\n|\r|\n/g, '').replace('"','\'\'').replace(',', '.');
                    reqData[que] = question.answer ? question.answer.replace(/\r?\n|\r/g, '').replace('"','\'\'').replace(',', '.') : '';
                    if (departmentQuestions.indexOf(que) === -1) {
                        departmentQuestions.push(que);
                    }
                })
            }

            return reqData;
        })
        return (
            <CSVLink headers={headers.concat(departmentQuestions).concat(generalQuestions)} data={data} target="_blank"
                     filename={filename}>
                <Button bsStyle="link">Download</Button>
            </CSVLink>
        )
    }

    render() {
        const {filter, visibleVolunteers, visibleRequests, departments, showTags, showRequestTags, maxAllocationReachedPhase1, maxAllocationReachedPhase2} = this.state;
        const department = departments.find(department => department._id === filter.departmentId);
        const logoImage = department && department.basicInfo.imageUrl ? department.basicInfo.imageUrl : Consts.DEFAULT_LOGO;
        const title = department ? `${department.basicInfo.nameEn} Volunteers` : 'All Volunteers';

        const allTags = new Set([].concat.apply([], visibleVolunteers.map(volunteer => volunteer.tags)));
        const tagOptions = [];
        allTags.forEach(tag => tagOptions.push({value: tag, label: formatTag(tag)}));

        const allRequestTags = new Set([].concat.apply([], visibleRequests.map(volunteer => volunteer.tags)));
        const requestTagOptions = [];
        allRequestTags.forEach(tag => requestTagOptions.push({value: tag, label: formatTag(tag)}));

        return (
            <div className="volunteer-list-tab-component">
                <div className="container card">
                    <Image src={logoImage} className="volunteer-list-department-logo"/>
                    <h1 className="volunteers-title">{title}</h1>
                    {this.state.departments.length > 1 &&
                    <Dropdown className="volunteer-department-dropdown" id="departments-dropdown"
                              onSelect={this.onSelectDepartment}>
                        <Dropdown.Toggle/>
                        <Dropdown.Menu>
                            {departments.map(department =>
                                <MenuItem key={department._id} eventKey={department._id}
                                          active={this.state.filter.departmentId === department._id}>
                                    {department.basicInfo.nameEn}
                                </MenuItem>
                            )}
                            <MenuItem divider/>
                            <MenuItem eventKey="all" active={!this.state.filter.departmentId}>All</MenuItem>
                        </Dropdown.Menu>
                    </Dropdown>}
                    {Permissions.isAdmin() &&
                    <Button bsStyle="primary" className="add-volunteers-button" onClick={this.showAddModal}>
                        Add Volunteers
                    </Button>}
                    <FormControl type="text" className="search-volunteer"
                                 value={this.state.filter.search} onChange={this.searchChanged}
                                 placeholder="Search by user's first name, last name or email"/>


                    <div className="tags-header">
                        <input type="checkbox"
                               checked={showTags}
                               onChange={this.handleOnShowTagToggle}/>
                        <h4>Filter by tags</h4>
                    </div>

                    {showTags &&
                    <TagFilter selected={filter.tags} options={allTags} onChange={this.handleOnTagFilterChange}/>}

                    <div className="volunteer-list-list-title">
                        <span>Volunteers: <span
                            className="counter">({`${this.state.visibleVolunteers.length} / ${this.state.volunteers.length}`})</span></span>
                        {this.downloadVolunteers()}
                    </div>

                    {this.state.numberOfRequests > 0 ?
                        <div className="no-volunteers">Loading</div>
                        : this.state.visibleVolunteers.length === 0 ?
                            <div className="no-volunteers">No Volunteers</div>
                            :
                            <Table striped condensed hover>
                                <thead>
                                <tr className="volunteer-list-group-item-header">
                                    {!this.state.filter.departmentId &&
                                    <th className="ellipsis-text flex2">Department</th>
                                    }
                                    <th className="ellipsis-text flex3">Midburn Profile</th>
                                    <th className="ellipsis-text flex2">First Name</th>
                                    <th className="ellipsis-text flex2">Last Name</th>
                                    {/* <th className="ellipsis-text flex3">Email</th> */}
                                    <th className="ellipsis-text flex2">Phone</th>
                                    {/* <th className="ellipsis-text flex2">Added Date</th> */}
                                    <th className="ellipsis-text flex2">Role</th>
                                    <th className="ellipsis-text flex1">Yearly</th>
                                    {/* <th className="ellipsis-text flex1">#Tickets</th> */}
                                    {/*<th className="ellipsis-text flex1">#Tickets Allocated</th>*/}
                                    {/* <th className="ellipsis-text flex1">9.5</th>
                                    <th className="ellipsis-text flex1">13.5</th> */}
                                    {/*<th className="ellipsis-text flex1">Early Entrance Phase 3?</th>*/}
                                    {/* <th className="ellipsis-text flex2">Other Departments</th> */}
                                    {showTags && <th className="ellipsis-text flex3">Tags</th>}
                                </tr>
                                </thead>
                                <tbody>
                                {this.state.visibleVolunteers.map(volunteer =>
                                    <tr key={volunteer._id}
                                        className={`${(!volunteer.sparkInfo || !volunteer.sparkInfo.validProfile) ? 'invalid' : (volunteer.needToFillGeneralForm ? 'missing-sign' : '')} ${volunteer.permission}`}
                                        // onClick={() => this.showEditModal(volunteer._id)}
                                    >
                                        {!this.state.filter.departmentId &&
                                        <td className="ellipsis-text flex2" onClick={() => this.showEditModal(volunteer._id)}>
                                            {this.state.departments.find(d => d._id === volunteer.departmentId).basicInfo.nameEn}
                                        </td>
                                        }
                                        <td className="ellipsis-text flex3" onClick={() => this.showEditModal(volunteer._id)}>{volunteer.userId}</td>
                                        <td className="ellipsis-text flex2" onClick={() => this.showEditModal(volunteer._id)}>
                                            {(volunteer.sparkInfo && volunteer.sparkInfo.firstName) ? volunteer.sparkInfo.firstName : 'No Data'}
                                        </td>
                                        <td className="ellipsis-text flex2" onClick={() => this.showEditModal(volunteer._id)}>
                                            {(volunteer.sparkInfo && volunteer.sparkInfo.lastName) ? volunteer.sparkInfo.lastName : 'No Data'}
                                        </td>
                                        {/* <td className="ellipsis-text flex3" onClick={() => this.showEditModal(volunteer._id)}>
                                            {volunteer.contactEmail ?
                                                <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${volunteer.contactEmail}`}
                                                   target="_blank">
                                                    {volunteer.contactEmail}
                                                </a> : 'No Data'}
                                        </td> */}
                                        <td className="ellipsis-text flex2" onClick={() => this.showEditModal(volunteer._id)}>
                                            {volunteer.contactPhone ? volunteer.contactPhone : 'No Data'}
                                        </td>
                                        {/* <td onClick={() => this.showEditModal(volunteer._id)}
                                            className="ellipsis-text flex2">{volunteer.createdAt ? volunteer.createdAt.split('T')[0] : 'N/A'}</td> */}
                                        <td className="ellipsis-text flex2" onClick={() => this.showEditModal(volunteer._id)}>{volunteer.permission}</td>
                                        <td className="ellipsis-text flex1" onClick={() => this.showEditModal(volunteer._id)}>{volunteer.yearly ? 'Yes' : 'No'}</td>
                                        {/* <td className="ellipsis-text flex1" onClick={() => this.showEditModal(volunteer._id)}>
                                            {volunteer.sparkInfo && typeof volunteer.sparkInfo.numOfTickets !== "undefined" ? volunteer.sparkInfo.numOfTickets : '???'}
                                        </td> */}
                                        {/*<td className="ellipsis-text flex1">*/}
                                            {/*<input type="number"*/}
                                                   {/*min="1"*/}
                                                   {/*max="2"*/}
                                                   {/*required value={volunteer.allocationsDetails !== null ? volunteer.allocationsDetails.allocatedTickets : 0}*/}
                                                   {/*onChange={(event) => this.onTicketsAllocatedChange(volunteer.userId, event.target.value)}/>*/}
                                        {/*</td>*/}
                                        {/* <td className="ellipsis-text flex1">
                                            <input type="checkbox" 
                                                   disabled={maxAllocationReachedPhase1 && !volunteer.allocationsDetails.allocatedEarlyEntrancePhase1} 
                                                   checked={volunteer.allocationsDetails !== null ? volunteer.allocationsDetails.allocatedEarlyEntrancePhase1 : false}
                                                   onChange={(event) => this.onEarlyEntranceAllocatedChange(volunteer.userId, event.target.checked, 1)}/>

                                        </td>
                                        <td className="ellipsis-text flex1">
                                            <input type="checkbox" 
                                                   disabled={maxAllocationReachedPhase2 && !volunteer.allocationsDetails.allocatedEarlyEntrancePhase2}
                                                   checked={volunteer.allocationsDetails !== null ? volunteer.allocationsDetails.allocatedEarlyEntrancePhase2 : false}
                                                   onChange={(event) => this.onEarlyEntranceAllocatedChange(volunteer.userId, event.target.checked, 2)}/>

                                        </td> */}
                                        {/*<td className="ellipsis-text flex1">*/}
                                            {/*<input type="checkbox"*/}
                                                   {/*checked={volunteer.allocationsDetails !== null ? volunteer.allocationsDetails.allocatedEarlyEntrance : false}*/}
                                                   {/*onChange={(event) => this.onEarlyEntranceAllocatedChange(volunteer.userId, event.target.checked, 3)}/>*/}

                                        {/*</td>*/}
                                        {/* <td onClick={() => this.showEditModal(volunteer._id)}
                                            className="ellipsis-text flex2">{volunteer.otherDepartments ? volunteer.otherDepartments.map(deptBasicInfo => deptBasicInfo.nameEn ? deptBasicInfo.nameEn : deptBasicInfo.nameHe).join() : ''}</td> */}
                                        {showTags &&
                                        <td className="flex3" onClick={event => event.stopPropagation()}>
                                            <Select.Creatable multi
                                                              value={volunteer.tags}
                                                              options={tagOptions}
                                                              shouldKeyDownEventCreateNewOption={key => key === 9 || key === 13}
                                                              promptTextCreator={label => label}
                                                              onChange={(tags) => this.onTagsChange(volunteer.userId, tags)}
                                            />
                                        </td>}
                                    </tr>
                                )}
                                </tbody>
                            </Table>}

                    <div className="tags-header">
                        <input type="checkbox"
                               checked={showRequestTags}
                               onChange={this.handleOnShowRequestTagToggle}/>
                        <h4>Filter by tags</h4>
                    </div>

                    {showRequestTags &&
                    <TagFilter selected={filter.requestTags} options={allRequestTags} onChange={this.handleOnRequestTagFilterChange}/>}

                    <div className="volunteer-list-list-title">
                        <span>Join Requests: <span
                            className="counter">({`${this.state.visibleRequests.length} / ${this.state.requests.length}`})</span></span>
                        {this.downloadRequests()}
                    </div>
                    {this.state.numberOfRequests > 0 ?
                        <div className="no-volunteers">Loading</div>
                        : this.state.visibleRequests.length === 0 ?
                            <div className="no-volunteers">No Join Requests</div>
                            :
                            <Table className="volunteer-list-group">
                                <thead>
                                <tr className="volunteer-list-group-item-header">
                                    {!this.state.filter.departmentId &&
                                    <th className="ellipsis-text flex2">Department</th>
                                    }
                                    <th className="ellipsis-text flex2">First Name</th>
                                    <th className="ellipsis-text flex2">Last Name</th>
                                    <th className="ellipsis-text flex3">Midburn Profile</th>
                                    <th className="ellipsis-text flex2">Phone</th>
                                    <th className="ellipsis-text flex3">Email</th>
                                    <th className="ellipsis-text flex2">Request Date</th>
                                    <th className="ellipsis-text flex1">#Tickets</th>
                                    {showRequestTags && <th className="ellipsis-text flex3">Tags</th>}
                                </tr>
                                </thead>
                                <tbody>
                                {this.state.visibleRequests.map(volunteerRequest =>
                                    <tr key={volunteerRequest._id}
                                        className={`volunteer-list-group-item ${(!volunteerRequest.sparkInfo || !volunteerRequest.sparkInfo.validProfile)  ? 'invalid' : (volunteerRequest.needToFillGeneralForm ? 'missing-sign' : '')}`}
                                        onClick={() => this.showRequestModal(volunteerRequest._id)}>
                                        {!this.state.filter.departmentId &&
                                        <td className="ellipsis-text flex2">
                                            {this.state.departments.find(d => d._id === volunteerRequest.departmentId).basicInfo.nameEn}
                                        </td>
                                        }
                                        <td className="ellipsis-text flex2">
                                            {volunteerRequest.sparkInfo && volunteerRequest.sparkInfo.firstName ? volunteerRequest.sparkInfo.firstName : 'No Data'}
                                        </td>
                                        <td className="ellipsis-text flex2">
                                            {volunteerRequest.sparkInfo && volunteerRequest.sparkInfo.lastName ? volunteerRequest.sparkInfo.lastName : 'No Data'}
                                        </td>
                                        <td className="ellipsis-text flex3">{volunteerRequest.userId}</td>
                                        <td className="ellipsis-text flex2">{volunteerRequest.contactPhone}</td>
                                        <td className="ellipsis-text flex3">
                                            <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${volunteerRequest.contactEmail}`}
                                               target="_blank">
                                                {volunteerRequest.contactEmail}
                                            </a>
                                        </td>
                                        <td className="ellipsis-text flex2">
                                            {volunteerRequest.createdAt ? volunteerRequest.createdAt.split('T')[0] : 'N/A'}
                                        </td>
                                        <td className="ellipsis-text flex1">
                                            {volunteerRequest.sparkInfo && typeof volunteerRequest.sparkInfo.numOfTickets !== "undefined" ? volunteerRequest.sparkInfo.numOfTickets : '???'}
                                        </td>
                                        {showRequestTags &&
                                        <td className="flex3" onClick={event => event.stopPropagation()}>
                                            <Select.Creatable multi
                                                              value={volunteerRequest.tags}
                                                              options={requestTagOptions}
                                                              shouldKeyDownEventCreateNewOption={key => key === 9 || key === 13}
                                                              promptTextCreator={label => label}
                                                              onChange={(tags) => this.onVolunteerRequestTagsChange(volunteerRequest.userId, tags)}
                                            />
                                        </td>}
                                    </tr>
                                )}
                                </tbody>
                            </Table>}

                </div>

                <VolunteerAddModal show={this.state.showAddModal} departmentId={this.state.filter.departmentId}
                                   departments={this.state.departments} onHide={this.hideModals}
                                   onSuccess={this.fetchVolunteers}/>
                <VolunteerEditModal show={!!this.state.editModalVolunteer} volunteer={this.state.editModalVolunteer}
                                    onHide={this.hideModals} onSuccess={this.fetchVolunteers}/>
                <VolunteerRequestPreviewModal show={!!this.state.editModalRequest} request={this.state.editModalRequest}
                                              onHide={this.hideModals} onSuccess={this.fetchVolunteers}/>

                <Modal show={this.state.errorAlert} onHide={this.hideErrorAlert} bsSize="sm">
                    <Modal.Header closeButton>
                        <Modal.Title>Error</Modal.Title>
                    </Modal.Header>
                    
                    <Modal.Body>
                        <Alert bsStyle="danger">
                            <strong>Failed</strong>
                        </Alert>
                    </Modal.Body>
                </Modal>}

                <Modal show={this.state.successAlert} onHide={this.hideSuccessAlert} bsSize="sm">
                    <Modal.Header closeButton>
                        <Modal.Title>Yay</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Alert bsStyle="success">
                            <strong>All good</strong>
                        </Alert>
                    </Modal.Body>
                </Modal>
            </div>
        );
    }
}
