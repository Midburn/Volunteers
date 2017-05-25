import React, {Component} from 'react';

import VolunteerRow from '../VolunteerRow/VolunteerRow.js';
import _ from 'lodash';

// css requires
require('./TableComponent.css');

export default class TableComponent extends Component {

    meetsFilters(volunteer) {
        return this.meetsTextFilter(volunteer) && this.meetsOptionsFilters(volunteer);
    }

    meetsTextFilter(volunteer) {
        let txt = this.props.filters.filterText.toLowerCase();
        return !txt ||
            volunteer.first_name.toLowerCase().indexOf(txt) !== -1 ||
            volunteer.last_name.toLowerCase().indexOf(txt) !== -1 ||
            volunteer.email.toLowerCase().indexOf(txt) !== -1;
    }

    meetsOptionsFilters(volunteer) {
        return this.meetsCriterion(this.props.filters.department, (volunteer.department_id || '').toString()) &&
            this.meetsCriterion(this.props.filters.role, (volunteer.role_id || '').toString()) &&
            this.meetsCriterion(this.props.filters.gotTicket, (volunteer.got_ticket || '').toString()) &&
            this.meetsCriterion(this.props.filters.isProduction, (volunteer.is_production || '').toString());
    }

    meetsCriterion(critetion, value) {
        return critetion === null || critetion === value;
    }

    departmentName = (department_id) => {
        if (!this.props.departments) {
            return ''
        }

        for (var i = 0; i < this.props.departments.length; i++) {
            var departmentObj = this.props.departments[i]
            if (departmentObj.id == department_id) {
                return departmentObj.name;
            }
        }

        return 'Unknown'
    }

    roleName = (role_id) => {
        if (!this.props.roles) {
            return ''
        }

        for (var i = 0; i < this.props.roles.length; i++) {
            var roleObj = this.props.roles[i]
            if (roleObj.id == role_id) {
                return roleObj.name;
            }
        }

        return 'Unknown'
    }

    render() {
        var rows = this.props.volunteers.filter((volunteer) => {
            return this.meetsFilters(volunteer);
        }).map((volunteer) => {
            return (
                <VolunteerRow
                    volunteer={volunteer}
                    roles={this.props.roles}
                    departments={this.props.departments}
                    key={'' + volunteer.department_id + '_' + volunteer.profile_id}
                    onRowDelete={this.props.onRowDelete}
                    onRowChange={this.props.onRowChange}/>)
        });

        return (
            <div className="table-component col-xs-12">
                <table className="table table-striped table-hover">
                    <thead>
                    <tr>
                        <th>Profile ID</th>
                        <th>Email</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Department</th>
                        <th>Role</th>
                        <th>Production</th>
                        <th>Phone</th>
                        <th>Got ticket</th>
                        <th>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows}
                    </tbody>
                </table>
            </div>
        );
    }
}