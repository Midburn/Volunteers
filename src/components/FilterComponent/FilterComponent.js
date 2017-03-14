var React = require('react');
var SearchFilter = require('./SearchFilter');
var DropdownFilter= require('./DropdownFilter');

module.exports = React.createClass({
    render: function() {
        return (
            <div className="filter-component">
                <SearchFilter/>
                <DropdownFilter/>
             </div>
        );
    }
});