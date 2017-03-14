var React = require('react');

module.exports = React.createClass({
    render: function() {
        return (
            <div className="filter-component">
                <label>Department</label>
                <input type="option" placeholder="All" />
            </div>
        );
    }
});