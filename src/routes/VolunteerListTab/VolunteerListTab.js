import React, {Component} from "react";
import axios from "axios";
import update from "immutability-helper";
import FilterComponent from "../../components/FilterComponent/FilterComponent";
import TableComponent from "../../components/TableComponent/TableComponent";
import Header from "../../components/Header/Header";

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
        if (err.response) {
            console.log('Data', err.response.data);
            console.log('Status', err.response.status);
            console.log('Headers', err.response.headers);
        }
        else console.log('Error', err.message);
    };

    fetchVolunteers = () => {
        axios.get('/api/v1/volunteers/')
            .then((res) => this.setState({volunteers: res.data}))
            .catch(this.logNetworkError);
    };

    fetchDepartments = () => {
        axios.get('/api/v1/departments')
            .then((res) => this.setState({departments: res.data}))
            .catch(this.logNetworkError);
    };

    fetchRoles() {
        axios.get('/api/v1/roles')
            .then((res) => this.setState({roles: res.data}))
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
                <Header />
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
