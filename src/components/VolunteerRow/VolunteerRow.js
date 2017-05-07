import React, { Component } from 'react';
import {Modal, Button} from 'react-bootstrap';
import update from 'immutability-helper';

import DropdownFilter from '../DropdownFilter/DropdownFilter.js';
import VolunteerEditModal from '../VolunteerEditModal/VolunteerEditModal.js';

export default class VolunteerRow extends Component {
    state = {
        edit:false,
        volunteer:{}
    }

    handleEdit = () => {
        this.setState( {edit: true} )
    }

    handleHide = () => {
        this.setState({edit:false})
    }

    handleSubmit = (diff) => {
        //TODO BUG
        //TODO either row is updated on every submit and then no need for diff merge or an additional send to server phase is added
        this.props.onRowChange(this.props.volunteer.department_id, this.props.volunteer.profile_id, diff);//TODO include department id in model

        this.setState((state)=>update(state,{ edit:{$set:false} ,volunteer: {$merge: diff}} ));
    }

    handleDelete = () => {
        this.props.onRowDelete(this.props.volunteer.department_id,this.props.volunteer.profile_id);
    }

    departmentName = () => {
        if (!this.props.departments) {
            return ''
        }
        
        for (var i = 0; i < this.props.departments.length; i++) {
            var departmentObj = this.props.departments[i]
            if (departmentObj.id == this.props.volunteer.department_id) {
                return departmentObj.name;
            }
        }

        return 'Unknown'
    }

    roleName = () => {
        if (!this.props.roles) {
            return ''
        }
        
        for (var i = 0; i < this.props.roles.length; i++) {
            var roleObj = this.props.roles[i]
            if (roleObj.id == this.props.volunteer.role_id) {
                return roleObj.name;
            }
        }

        return 'Unknown'
    }

    
    render() {
        if (!this.props.volunteer){
            return null;
        }
        else {
            let effectiveVolunteer = update(this.props.volunteer,{$merge:this.state.volunteer});

            return (          
                <tr className="volunteer-row">
                    <VolunteerEditModal 
                        show={!!this.state.edit} 
                        onHide={this.handleHide} 
                        onSubmit={this.handleSubmit}
                        volunteer={effectiveVolunteer}
                        roles={this.props.roles}/>
                    <td>{effectiveVolunteer.profile_id}</td>
                    <td>{effectiveVolunteer.email}</td>
                    <td>{effectiveVolunteer.first_name}</td>
                    <td>{effectiveVolunteer.last_name}</td>
                    <td>{this.departmentName()}</td>
                    <td>{this.roleName()}</td>
                    <td>{effectiveVolunteer.is_production?'Yes':'No'}</td>
                    <td>{effectiveVolunteer.phone}</td>
                    <td>{effectiveVolunteer.got_ticket?'Yes':'No'}</td>
                    <td><a href="#" onClick={this.handleEdit}>Edit</a>/<a href="#" onClick={this.handleDelete}>Delete</a></td>
                </tr>
            );
        }
    }
}