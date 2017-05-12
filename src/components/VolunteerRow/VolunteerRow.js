import React, {Component} from "react";
import {Modal, Button} from "react-bootstrap";
import VolunteerEditModal from "../VolunteerEditModal/VolunteerEditModal.js";
import _ from "lodash";

export default class VolunteerRow extends Component {
    state = {
        edit: false,
        volunteer: {}
    };

    handleEdit = () => {
        this.setState({edit: true})
    };

    handleHide = () => {
        this.setState({edit: false})
    };

    handleSubmit = (roleId) => {
        this.props.onRowChange(this.props.volunteer.profile_id, this.props.volunteer.department_id, roleId);
    };

    handleDelete = () => {
        this.props.onRowDelete(this.props.volunteer.profile_id, this.props.volunteer.department_id);
    };

    render() {
        if (!this.props.volunteer) {
            return null;
        }

        const volunteer = this.props.volunteer;

        return (
            <tr className="volunteer-row">
                <VolunteerEditModal
                    show={!!this.state.edit}
                    onHide={this.handleHide}
                    onSubmit={this.handleSubmit}
                    volunteer={volunteer}
                    roles={this.props.roles}/>
                <td>{volunteer.profile_id}</td>
                <td>{volunteer.email}</td>
                <td>{volunteer.first_name}</td>
                <td>{volunteer.last_name}</td>
                <td>{_.get(this.props.departments.find(department => department.id === volunteer.department_id), 'name', 'Unavailable')}</td>
                <td>{_.get(this.props.roles.find(role => role.id === volunteer.role_id), 'name', 'Unavailable')}</td>
                <td>{volunteer.is_production ? 'Yes' : 'No'}</td>
                <td>{volunteer.phone}</td>
                <td>{volunteer.got_ticket ? 'Yes' : 'No'}</td>
                <td>
                    <a href="#" onClick={this.handleEdit}>Edit</a>/
                    <a href="#" onClick={this.handleDelete}>Delete</a>
                </td>
            </tr>
        );
    }
}