var React = require('react');

import DropdownFilter from '../DropdownFilter/DropdownFilter.js'

export default class VolunteerRow extends React.Component{
    constructor(props){
        super(props);
        this.state={
            edit:false
        };
        this.toggleEdit=this.toggleEdit.bind(this);
    }

    toggleEdit(){
        console.log(this.state.edit);
        this.setState( {edit: !this.state.edit} );
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
                    <td>{volunteer.profile_id}</td>
                    <td>{volunteer.email}</td>
                    <td>{volunteer.first_name}</td>
                    <td>{volunteer.last_name}</td>
                    <td>{this.state.edit?departmentDropdown:volunteer.department}</td>
                    <td>{volunteer.role}</td>
                    <td>{volunteer.volunteer_type}</td>
                    <td>{volunteer.is_production?'Yes':'No'}</td>
                    <td>{volunteer.phone}</td>
                    <td>{volunteer.got_ticket?'Yes':'No'}</td>
                    <td><a href="#" onClick={this.toggleEdit}>{this.state.edit?'Cancel':'Edit'}</a>/<a href="#" onClick={()=>alert('delete clicked')}>Delete</a></td>
                </tr>
            );
        }
    }
}