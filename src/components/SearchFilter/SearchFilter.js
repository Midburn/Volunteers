var React = require('react');

module.exports = React.createClass({
    render: function() {
        return (
            <div className="filter-component form-group">
                <label for="search_name">Search</label>
                <input type="text" id="search_name" className="form-control" placeholder="Search by user's first name, last name or email" />
            </div>
        );
    }
});