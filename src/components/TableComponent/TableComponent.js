import React from 'react';

import VolunteerRow from '../VolunteerRow/VolunteerRow.js';

// css requires
require('./TableComponent.css');

export default class TableComponent extends React.Component{
    constructor(props){
        super(props);
    }
    
    meetsFilters(volunteer){
        return this.meetsTextFilter(volunteer) && this.meetsOptionsFilters(volunteer);
    }

    meetsTextFilter(volunteer){
        let txt= this.props.filters.filterText.toLowerCase();
        return !txt ||
            volunteer.first_name.toLowerCase().indexOf(txt)!==-1 ||
            volunteer.last_name.toLowerCase().indexOf(txt)!==-1 ||
            volunteer.email.toLowerCase().indexOf(txt)!==-1;
    }

    meetsOptionsFilters(volunteer){    
        return this.meetsCriterion(this.props.filters.department,volunteer.department) &&
        this.meetsCriterion(this.props.filters.role,volunteer.role) &&
        this.meetsCriterion(this.props.filters.gotTicket,volunteer.got_ticket) &&
        this.meetsCriterion(this.props.filters.isProduction,volunteer.is_production);
    }

    meetsCriterion(critetion,value){
        return critetion===null || critetion===value;
    }

    render () {
        console.log('TableComponent.render');
        console.log(this.props);
        var rows = this.props.volunteers.
        filter( (volunteer)=> {return this.meetsFilters(volunteer);}).
        map( (volunteer) =>{ return (
            <VolunteerRow 
            volunteer={volunteer} 
            key={volunteer.profile_id}
            onRowDelete= {this.props.onRowDelete}
            onRowChange= {this.props.onRowChange}/>)});

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