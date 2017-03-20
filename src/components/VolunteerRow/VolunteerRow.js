import React from 'react';
import {Modal, OverlayTrigger, Button} from 'react-bootstrap';

import DropdownFilter from '../DropdownFilter/DropdownFilter.js';
import VolunteerEditModal from '../VolunteerEditModal/VolunteerEditModal.js';

export default class VolunteerRow extends React.Component{
    constructor(props){
        super(props);
        this.state={
            edit:false
        };
        this.toggleEdit=this.toggleEdit.bind(this);
        this.handleSubmit=this.handleSubmit.bind(this);
    }

    toggleEdit(){
        console.log('row.toggleEdit');
        this.setState( {edit: !this.state.edit} );
    }

    handleSubmit(volunteerChange){
        console.log('row.submit');
        this.setState(volunteerChange);
        this.toggleEdit();
    }
    
    render() {
        var volunteer = this.props.volunteer;
        if (!volunteer){
            console.log('volunteer is falsy. That is a bug');
            return null;
        }
        else {
            let departmentDropdown = (
            <DropdownFilter label="Department" 
                        onFilterInput={()=>console.log('onFilterInput Called')}
                        options={['All','Tech','Navadim','Mapatz','Tnua','Merkazia']}
                        myFilter={()=>console.log('myFilter called')}/>
            );

           

            return (          
                <tr className="volunteer-row">
                    <VolunteerEditModal 
                        show={!!this.state.edit} 
                        onHide={this.toggleEdit} 
                        onSubmit={this.handleSubmit}
                        volunteer={volunteer}/>
                    <td>{volunteer.profile_id}</td>
                    <td>{volunteer.email}</td>
                    <td>{volunteer.first_name}</td>
                    <td>{volunteer.last_name}</td>
                    <td>{this.state.edit?departmentDropdown:volunteer.department}</td>
                    <td>{this.state.role !== undefined?this.state.role:volunteer.role}</td>
                    <td>{volunteer.volunteer_type}</td>
                    <td>{ (this.state.is_production!==undefined ?this.state.is_production : volunteer.is_production)?'Yes':'No'}</td>
                    <td>{volunteer.phone}</td>
                    <td>{volunteer.got_ticket?'Yes':'No'}</td>
                    <td><a href="#" onClick={this.toggleEdit}>{this.state.edit?'Cancel':'Edit'}</a>/<a href="#" onClick={()=>alert('delete clicked')}>Delete</a></td>
                </tr>
            );
        }
    }
}