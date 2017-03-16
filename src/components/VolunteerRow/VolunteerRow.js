var React = require('react');

module.exports = React.createClass({
    render: function () {
        var volunteer = this.props.volunteer;
        if (!volunteer){
            console.log('volunteer is falsy. That is a bug');
            return null;
        }
        else
            return (
                <tr className="volunteer-row">
                    <td>{volunteer.profile_id}</td>
                    <td>{volunteer.email}</td>
                    <td>{volunteer.first_name}</td>
                    <td>{volunteer.last_name}</td>
                    <td>{volunteer.department}</td>
                    <td>{volunteer.role}</td>
                    <td>{volunteer.volunteer_type}</td>
                    <td>{volunteer.is_production?'Yes':'No'}</td>
                    <td>{volunteer.phone}</td>
                    <td>{volunteer.got_ticket?'Yes':'No'}</td>
                    <td><a href="#">Edit</a>/<a href="#">Delete</a></td>

                </tr>
            );
    }
});