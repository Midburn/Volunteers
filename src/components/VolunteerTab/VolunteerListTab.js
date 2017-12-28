import React, {Component} from 'react';
import axios from 'axios';
import { Dropdown, MenuItem, Button, FormControl, ListGroup, ListGroupItem, Image } from 'react-bootstrap'
import * as Permissions from "../../model/permissionsUtils"
import VolunteerAddModal from "./VolunteerAddModal"
import VolunteerEditModal from "./VolunteerEditModal"

require('./VolunteerListTab.css');

const DEFAULT_LOGO = 'https://yt3.ggpht.com/-t7buXM4UqEc/AAAAAAAAAAI/AAAAAAAAAAA/n5U37nYuExw/s900-c-k-no-mo-rj-c0xffffff/photo.jpg';

export default class VolunteerListTab extends Component {

  constructor(props) {
    super(props);
    this.state = {
      volunteers: [],
      visibleVolunteers: [],
      numberOfRequests: 0,

      departments: [],

      filter: {
        search: '',
        departmentId: null
      },

      showAddModal: false,
      editModalVolunteer: ''
    }
  }

  componentWillMount() {
    this.fetchDepartments();
  }

  fetchDepartments = () => {
    axios.get("/api/v1/departments")
    .then(res => {
      const departments = res.data;
      this.state.departments = departments.filter(department => 
          Permissions.isAdmin() || Permissions.isManagerOfDepartment(department._id));
      this.state.filter.departmentId = departments && departments[0]._id;
      this.setState(this.state);
      this.fetchVolunteers();
    })
  }

  fetchVolunteers = () => {
    this.state.volunteers = [];
    this.state.numberOfRequests = this.state.departments.length;
    this.setState(this.state);
    for (let i = 0; i<this.state.departments.length; i++) {
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
    }
  }

  updateVisibleVolunteers = _ => {
    const searchTerm = this.state.filter.search.toLowerCase().trim();

    this.state.visibleVolunteers = this.state.volunteers.filter(volunteer => {
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

      return true;
    })
    this.setState(this.state);
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
    this.setState(this.state);
    this.updateVisibleVolunteers();
  }

  showAddModal = _ => {
    this.state.showAddModal = true;
    this.setState(this.state);
  }

  hideAddModal = _ => {
    this.state.showAddModal = false;
    this.setState(this.state);
  }

  showEditModal = volunteerId => _ => {
    this.state.editModalVolunteer = this.state.visibleVolunteers.find(volunteer => volunteer._id === volunteerId);
    this.setState(this.state);
  }

  hideEditModal = _ => {
    this.state.editModalVolunteer = null;
    this.setState(this.state);
  }

  render() {
    const {filter, volunteers, departments} = this.state;
    const department = departments.find(department => department._id === filter.departmentId);
    const logoImage = department && department.basicInfo.imageUrl ? department.basicInfo.imageUrl : DEFAULT_LOGO;
    const title = department ? `${department.basicInfo.nameEn} Volunteers` : 'All Volunteers';
    return (
      <div className="volunteer-list-tab-component">
        <div className="container card">
          <Image src={logoImage} className="volunteer-list-department-logo"></Image>
          <h1 className="volunteers-title">{title}</h1>
          {this.state.departments.length > 1 &&
          <Dropdown className="volunteer-department-dropdown" id="departments-dropdown" onSelect={this.onSelectDepartment}>
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
                <span className="ellipsis-text flex3">Email</span>
                <span className="ellipsis-text flex2">First Name</span>
                <span className="ellipsis-text flex2">Last Name</span>
                <span className="ellipsis-text flex1">Role</span>
                <span className="ellipsis-text flex1">Yearly</span>
              </ListGroupItem>
              {this.state.visibleVolunteers.map(volunteer => 
              <ListGroupItem key={volunteer._id} className="volunteer-list-group-item" onClick={this.showEditModal(volunteer._id)}>
                {!this.state.filter.departmentId &&
                  <span className="ellipsis-text flex2">{this.state.departments.find(d => d._id === volunteer.departmentId).basicInfo.nameEn}</span>
                }
                <span className="ellipsis-text flex3">{volunteer.userId}</span>
                <span className="ellipsis-text flex2">{volunteer.firstName ? volunteer.firstName : 'No Data'}</span>
                <span className="ellipsis-text flex2">{volunteer.lastName ? volunteer.lastName : 'No Data'}</span>
                <span className="ellipsis-text flex1">{volunteer.permission}</span>
                <span className="ellipsis-text flex1">{volunteer.yearly ? 'Yes' : 'No'}</span>
              </ListGroupItem>
              )}
            </ListGroup>}
        </div>
        <VolunteerAddModal show={this.state.showAddModal} departmentId={this.state.filter.departmentId}
                          departments={this.state.departments} onHide={this.hideAddModal} 
                          onSuccess={this.fetchVolunteers}/>
        <VolunteerEditModal show={!!this.state.editModalVolunteer} volunteer={this.state.editModalVolunteer}
                          onHide={this.hideEditModal} onSuccess={this.fetchVolunteers}/>
      </div>
    );
  }
}
