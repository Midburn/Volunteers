var React = require('react');
var VolunteerRow = require('../VolunteerRow/VolunteerRow.js');

module.exports = React.createClass({
    render: function () {
        var rows = [];
        this.props.volunteers.forEach(function (volunteer) {
            rows.push(<VolunteerRow volunteer={volunteer} />);
        });
        return (
            <div className="table-component">
                <table>
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