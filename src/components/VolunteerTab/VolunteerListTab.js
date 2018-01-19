import React, {Component} from 'react';
import axios from 'axios';
import {Dropdown, MenuItem, Button, FormControl, ListGroup, ListGroupItem, Image} from 'react-bootstrap'
import * as Permissions from "../../model/permissionsUtils"
import * as Consts from '../../model/consts'
import Select from 'react-select';
import VolunteerAddModal from "./VolunteerAddModal"
import VolunteerEditModal from "./VolunteerEditModal"
import VolunteerRequestPreviewModal from "./VolunteerRequestPreviewModal"
import {CSVLink} from 'react-csv';
import TagFilter from "../TagFilter";

import './VolunteerListTab.css';

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
                tags: new Set()
            },

            showAddModal: false,
            editModalVolunteer: '',
            editModalRequest: '',
            showTags: true
        };

        this.onTagsChange = this.onTagsChange.bind(this);
        this.updateVolunteer = this.updateVolunteer.bind(this);
        this.handleOnTagFilterChange = this.handleOnTagFilterChange.bind(this);
        this.updateVisibleVolunteers = this.updateVisibleVolunteers.bind(this);
        this.handleOnShowTagToggle = this.handleOnShowTagToggle.bind(this);
        this.showEditModal = this.showEditModal.bind(this);
    }

    componentWillMount() {
        this.fetchDepartments();
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
            const eventId = '1';
            axios.get(`/api/v1/departments/${departmentId}/events/${eventId}/requests`)
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

    compareDates = (a, b) => {
        let dateA = a ? new Date(a).getTime() : 0;
        let dateB = b ? new Date(b).getTime() : 0;
        return dateA < dateB
    }

    updateVisibleVolunteers = _ => {
        const searchTerm = this.state.filter.search ? this.state.filter.search.toLowerCase().trim() : "";
        const isVisible = volunteer => {
            if (this.state.filter.departmentId && this.state.filter.departmentId !== volunteer.departmentId) {
                return false;
            }
            if (searchTerm) {
                const match = volunteer.userId.toLowerCase().indexOf(searchTerm) > -1 ||
                    (volunteer.firstName && volunteer.firstName.toLowerCase().indexOf(searchTerm) > -1) ||
                    (volunteer.lastName && volunteer.lastName.toLowerCase().indexOf(searchTerm) > -1);
                if (!match) {
                    return false;
                }
            }

            const selectedTags = this.state.filter.tags;
            if (selectedTags.size !== 0) {
                const intersection = volunteer.tags.filter(tag => selectedTags.has(tag));
                if (intersection.length === 0) return false;
            }
            return true;
        };

        const visibleVolunteers = this.state.volunteers.filter(isVisible).sort((a, b) => this.compareDates(a.createdAt, b.createdAt));
        const visibleRequests = this.state.requests.filter(isVisible).sort((a, b) => this.compareDates(a.createdAt, b.createdAt));
        this.setState({visibleVolunteers, visibleRequests});
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
        const {departmentId} = this.state.filter;

        axios.put(`/api/v1/departments/${departmentId}/volunteer/${volunteer._id}`, {
            permission: volunteer.permission,
            yearly: volunteer.yearly === 'true',
            tags: volunteer.tags
        });
    }


    onTagsChange(userId, tags) {
        const {visibleVolunteers} = this.state;
        const volunteer = visibleVolunteers.find(volunteer => volunteer.userId === userId);
        volunteer['tags'] = tags.map(tag => tag.value);

        this.setState({visibleVolunteers});
        this.updateVolunteer(volunteer);
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

    handleOnShowTagToggle(event) {
        this.setState(
            {showTags: event.target.checked, filter: {...this.filter, tags: new Set()}},
            this.updateVisibleVolunteers);
    }

    render() {
        const {filter, visibleVolunteers, departments, showTags} = this.state;
        const department = departments.find(department => department._id === filter.departmentId);
        const logoImage = department && department.basicInfo.imageUrl ? department.basicInfo.imageUrl : Consts.DEFAULT_LOGO;
        const title = department ? `${department.basicInfo.nameEn} Volunteers` : 'All Volunteers';

        const allTags = new Set([].concat.apply([], visibleVolunteers.map(volunteer => volunteer.tags)));
        const tagOptions = [];
        allTags.forEach(tag => tagOptions.push({value: tag, label: formatTag(tag)}));

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
                    <Button bsStyle="primary" className="add-volunteers-button"
                            onClick={this.showAddModal}>Add Volunteers</Button>
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
                        <span>Volunteers:</span>
                        <CSVLink data={
                            this.state.visibleVolunteers.map(volunteer => ({
                                Department: this.state.departments.find(d => d._id === volunteer.departmentId).basicInfo.nameEn,
                                Email: volunteer.userId,
                                "First Name": volunteer.firstName ? volunteer.firstName : 'No Data',
                                "Last Name": volunteer.lastName ? volunteer.lastName : 'No Data',
                                "Added Date": volunteer.createdAt ? volunteer.createdAt.split('T')[0] : 'N/A',
                                Role: volunteer.permission,
                                Yearly: volunteer.yearly ? 'Yes' : 'No',
                                Tags: volunteer.tags.join(", ")
                            }))}
                                 filename={(this.state.filter.departmentId ? this.state.departments.find(d => d._id === this.state.filter.departmentId).basicInfo.nameEn : "all") + "-volunteers.csv"}
                                 target="_blank"
                        >
                            <Button bsStyle="link">Download</Button>
                        </CSVLink>
                    </div>

                    {this.state.numberOfRequests > 0 ?
                        <div className="no-volunteers">Loading</div>
                        : this.state.visibleVolunteers.length === 0 ?
                            <div className="no-volunteers">No Volunteers</div>
                            :
                            <ListGroup className="volunteer-list-group">
                                <ListGroupItem className="volunteer-list-group-item-header">
                                    {!this.state.filter.departmentId &&
                                    <span className="ellipsis-text flex2">Department</span>
                                    }
                                    <span className="ellipsis-text flex3">Midburn Profile</span>
                                    <span className="ellipsis-text flex2">First Name</span>
                                    <span className="ellipsis-text flex2">Last Name</span>
                                    <span className="ellipsis-text flex2">Added Date</span>
                                    <span className="ellipsis-text flex1">Role</span>
                                    <span className="ellipsis-text flex1">Yearly</span>
                                    <span className="ellipsis-text flex1">Other Departments</span>
                                    {showTags && <span className="ellipsis-text flex2">Tags</span>}
                                </ListGroupItem>
                                {this.state.visibleVolunteers.map(volunteer =>
                                    <ListGroupItem key={volunteer._id}
                                                   className="volunteer-list-group-item"
                                                   onClick={event => {
                                                       if (event.type === 'click' && event.clientX !== 0 && event.clientY !== 0) {
                                                           this.showEditModal(volunteer._id)
                                                       }
                                                   }}
                                    >
                                        {!this.state.filter.departmentId &&
                                        <span
                                            className="ellipsis-text flex2">{this.state.departments.find(d => d._id === volunteer.departmentId).basicInfo.nameEn}</span>
                                        }
                                        <span className="ellipsis-text flex3"><a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${volunteer.userId}`} target="_blank">{volunteer.userId}</a></span>
                                        <span
                                            className="ellipsis-text flex2">{volunteer.firstName ? volunteer.firstName : 'No Data'}</span>
                                        <span
                                            className="ellipsis-text flex2">{volunteer.lastName ? volunteer.lastName : 'No Data'}</span>
                                        <span
                                            className="ellipsis-text flex2">{volunteer.createdAt ? volunteer.createdAt.split('T')[0] : 'N/A'}</span>
                                        <span className="ellipsis-text flex1">{volunteer.permission}</span>
                                        <span className="ellipsis-text flex1">{volunteer.yearly ? 'Yes' : 'No'}</span>
                                        <span
                                            className="ellipsis-text flex1">{volunteer.otherDepartments ? volunteer.otherDepartments.map(deptBasicInfo => deptBasicInfo.nameEn ? deptBasicInfo.nameEn : deptBasicInfo.nameHe).join() : ''}</span>
                                        {showTags && <span className="flex2"
                                                           onClick={event => event.stopPropagation()}
                                        >
                                            <Select.Creatable multi
                                                              value={volunteer.tags}
                                                              options={tagOptions}
                                                              onChange={(tags) => this.onTagsChange(volunteer.userId, tags)}
                                            />
                                        </span>}
                                    </ListGroupItem>
                                )}
                            </ListGroup>}

                    <div className="volunteer-list-list-title">Join Requests:</div>
                    {this.state.numberOfRequests > 0 ?
                        <div className="no-volunteers">Loading</div>
                        : this.state.visibleRequests.length === 0 ?
                            <div className="no-volunteers">No Join Requests</div>
                            :
                            <ListGroup className="volunteer-list-group">
                                <ListGroupItem className="volunteer-list-group-item-header">
                                    {!this.state.filter.departmentId &&
                                    <span className="ellipsis-text flex2">Department</span>
                                    }
                                    <span className="ellipsis-text flex2">First Name</span>
                                    <span className="ellipsis-text flex2">Last Name</span>
                                    <span className="ellipsis-text flex3">Midburn Profile</span>
                                    <span className="ellipsis-text flex2">Phone</span>
                                    <span className="ellipsis-text flex3">Email</span>
                                    <span className="ellipsis-text flex2">Request Date</span>
                                </ListGroupItem>
                                {this.state.visibleRequests.map(volunteerRequest =>
                                    <ListGroupItem key={volunteerRequest._id} className={`volunteer-list-group-item ${!volunteerRequest.validProfile ? 'invalid' : ''}`}
                                                   onClick={() => this.showRequestModal(volunteerRequest._id)}>
                                        {!this.state.filter.departmentId &&
                                        <span
                                            className="ellipsis-text flex2">{this.state.departments.find(d => d._id === volunteerRequest.departmentId).basicInfo.nameEn}</span>
                                        }
                                        <span className="ellipsis-text flex2">{volunteerRequest.firstName ? volunteerRequest.firstName : 'No Data'}</span>
                                        <span className="ellipsis-text flex2">{volunteerRequest.lastName ? volunteerRequest.lastName : 'No Data'}</span>
                                        <span className="ellipsis-text flex3">{volunteerRequest.userId}</span>
                                        <span className="ellipsis-text flex2">{volunteerRequest.contactPhone}</span>
                                        <span className="ellipsis-text flex3"><a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${volunteerRequest.contactEmail}`} target="_blank">{volunteerRequest.contactEmail}</a></span>
                                        <span className="ellipsis-text flex2">{volunteerRequest.createdAt ? volunteerRequest.createdAt.split('T')[0] : 'N/A'}</span>
                                    </ListGroupItem>
                                )}
                            </ListGroup>}

                </div>

                <VolunteerAddModal show={this.state.showAddModal} departmentId={this.state.filter.departmentId}
                                   departments={this.state.departments} onHide={this.hideModals}
                                   onSuccess={this.fetchVolunteers}/>
                <VolunteerEditModal show={!!this.state.editModalVolunteer} volunteer={this.state.editModalVolunteer}
                                    onHide={this.hideModals} onSuccess={this.fetchVolunteers}/>
                <VolunteerRequestPreviewModal show={!!this.state.editModalRequest} request={this.state.editModalRequest}
                                             onHide={this.hideModals} onSuccess={this.fetchVolunteers}/>
            </div>
        );
    }
}
