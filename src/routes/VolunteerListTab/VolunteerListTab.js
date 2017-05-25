import React, {Component} from 'react';
import axios from 'axios';
import update from 'immutability-helper';
import FilterComponent from '../../components/FilterComponent/FilterComponent';
import TableComponent from '../../components/TableComponent/TableComponent';

export default class VolunteerListTab extends Component {

  constructor(props) {
    super(props);

    this.state = {
      volunteers: [],
      roles: [],
      departments: [],
      filters: {
        filterText: '',
        department: null,
        role: null,
        gotTicket: null,
        isProduction: null
      }
    }
  }

  componentWillMount() {
    this.fetchDepartments();
    this.fetchVolunteers();
    this.fetchRoles();
  }

  logNetworkError = (err) => {
    console.log('Error fetching the data')
  };

  fetchVolunteers = () => {
    const isAdmin = document.roles.some(role => role.permission === 1);

    if (isAdmin) {
      return axios.get('/api/v1/volunteers/')
        .then((res) => this.setState({volunteers: res.data}))
        .catch(this.logNetworkError);
    }

    const permittedDepartments = document.roles.map(role => role.department_id);
    for (let index = 0; index < permittedDepartments.length; index++) {
      axios.get(`/api/v1/departments/${permittedDepartments[index]}/volunteers`)
        .then((res) => {
          let updatedVolunteers = this.state.volunteers.slice().concat(res.data);
          this.setState({volunteers: updatedVolunteers})
        })
        .catch(this.logNetworkError);
    }
  };

  fetchDepartments = () => {
    axios.get('/api/v1/departments')
      .then((res) => {
        const departments = res.data.sort((a, b) => a.name.localeCompare(b.name));
        const {filters} = this.state;
        filters.department = departments && departments[0].id.toString();
        this.setState({
          filters: filters,
          departments: departments
        });
      })
      .catch(this.logNetworkError);
  };

  fetchRoles() {
    axios.get('/api/v1/roles')
      .then((res) => {
        const roles = res.data;
        this.setState({roles: roles});
      })
      .catch(this.logNetworkError);
  }

  handleVolunteerDelete = (profile_id, department) => {

    axios.delete(`/api/v1/departments/${department}/volunteers/${profile_id}`)
      .then(this.fetchVolunteers)
      .catch(this.logNetworkError);
  };

  handleRoleChange = (profileId, departmentId, roleId) => {
    axios
      .put(`/api/v1/departments/${departmentId}/volunteers/${profileId}`, {role_id: roleId})
      .then(this.fetchVolunteers)
      .catch(this.logNetworkError);
  };

  handleFilterTextInput = (filterText) => {
    this.handleFilterInput('filterText', filterText);
  };

  handleFilterInput = (filterName, value) => {
    const mergeValue = {
      filters: {
        $merge: {
          [filterName]: value
        }
      }
    };
    this.setState((previousState) => update(previousState, mergeValue));
  };

  render() {
    const {filters, volunteers, roles, departments} = this.state;
    return (
      <div className="volunteer-list-tab-component">
        <div className="container card">
          <FilterComponent
            filters={filters}
            onFilterTextInput={this.handleFilterTextInput}
            onFilterInput={this.handleFilterInput}
            roles={roles}
            departments={departments}
            onSuccess={this.fetchVolunteers}/>
        </div>
        <div className="container card container">
          <TableComponent
            volunteers={volunteers}
            filters={filters}
            roles={roles}
            departments={departments}
            onRowDelete={this.handleVolunteerDelete}
            onRowChange={this.handleRoleChange}/>
        </div>
      </div>
    );
  }
}
