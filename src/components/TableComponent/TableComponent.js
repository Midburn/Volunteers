var React = require('react');

module.exports = React.createClass({
    render: function() {
        return (
            <div className="table-component col-xs-12">
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Profile ID</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>Eyal</td>
                            <td>Liebermann</td>
                        </tr>
                        <tr>
                            <td>1</td>
                            <td>Eyal</td>
                            <td>Liebermann</td>
                        </tr>
                        <tr>
                            <td>1</td>
                            <td>Eyal</td>
                            <td>Liebermann</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
});