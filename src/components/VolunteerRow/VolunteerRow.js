import React from 'react';
import {Modal, Button} from 'react-bootstrap';
import update from 'immutability-helper';

import DropdownFilter from '../DropdownFilter/DropdownFilter.js';
import VolunteerEditModal from '../VolunteerEditModal/VolunteerEditModal.js';

export default class VolunteerRow extends React.Component{
    constructor(props){
        super(props);
        this.state={
            edit:false,
            volunteer:{}
        };
        this.toggleEdit=this.toggleEdit.bind(this);
        this.handleSubmit=this.handleSubmit.bind(this);
    }

    toggleEdit(){
        this.setState( {edit: !this.state.edit} );
    }

    handleSubmit(volunteerChange){
        console.log('VolunteerRow.handleSubmit');
        console.log(volunteerChange);

        this.setState((state)=>update(state,{volunteer: {$merge: volunteerChange}} ));
        this.toggleEdit();
    }
    
    render() {
        console.log('VolunteerRow.render');
        console.log(this.props.volunteer);
        console.log(this.state.volunteer);

        if (!this.props.volunteer){
            console.log('props.volunteer is falsy. That is a bug');
            return null;
        }
        else {
            let effectiveVolunteer=update(this.props.volunteer,{$merge:this.state.volunteer});
            console.log(effectiveVolunteer);

            return (          
                <tr className="volunteer-row">
                    <VolunteerEditModal 
                        show={!!this.state.edit} 
                        onHide={this.toggleEdit} 
                        onSubmit={this.handleSubmit}
                        volunteer={effectiveVolunteer}/>
                    <td>{effectiveVolunteer.profile_id}</td>
                    <td>{effectiveVolunteer.email}</td>
                    <td>{effectiveVolunteer.first_name}</td>
                    <td>{effectiveVolunteer.last_name}</td>
                    <td>{effectiveVolunteer.department}</td>
                    <td>{effectiveVolunteer.role}</td>
                    <td>{effectiveVolunteer.volunteer_type}</td>
                    <td>{effectiveVolunteer.is_production?'Yes':'No'}</td>
                    <td>{effectiveVolunteer.phone}</td>
                    <td>{effectiveVolunteer.got_ticket?'Yes':'No'}</td>
                    <td><a href="#" onClick={this.toggleEdit}>{this.state.edit?'Cancel':'Edit'}</a>/<a href="#" onClick={()=>alert('delete clicked')}>Delete</a></td>
                </tr>
            );
        }
    }
}