var React = require('react');

module.exports = React.createClass({
    render: function() {
        return (
            <div className="filter-component">
                <label>Search</label>
                <input type="text" placeholder="Search by user first name, last name or email" />
            </div>
        );
    }
});