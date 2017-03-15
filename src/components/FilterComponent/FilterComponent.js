var React = require('react');
var SearchFilter = require('../SearchFilter/SearchFilter');
var DropdownFilter= require('../DropdownFilter/DropdownFilter');

module.exports = React.createClass({
    render: function() {
        return (
            <div className="filter-component">
                <SearchFilter/>
                <DropdownFilter column="Department"/>
                <DropdownFilter column="Volunteer Type"/>
                <DropdownFilter column="Got Ticket"/>
                <DropdownFilter column="Production"/>

             </div>
        );
    }
});