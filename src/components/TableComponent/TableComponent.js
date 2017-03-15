var React = require('react');
var VolunteerRow = require('../VolunteerRow/VolunteerRow.js');

module.exports = React.createClass({
    meetsFilters:function(volunteer){
        let txt= this.props.filters.filterText.toLowerCase();
        return !txt
        || volunteer.firstName.toLowerCase().indexOf(txt)!==-1
        || volunteer.lastName.toLowerCase().indexOf(txt)!==-1
        || volunteer.email.toLowerCase().indexOf(txt)!==-1
        ;},
    render: function () {
       // var that=this;
        var rows = this.props.volunteers.
        filter( (volunteer)=> {return this.meetsFilters(volunteer);}).
        map(function (volunteer) { return (<VolunteerRow volunteer={volunteer} />)});
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
                            <th>Volunteer Type</th>
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
});