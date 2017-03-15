var React = require('react');
//  var SearchFilter = require('../SearchFilter/SearchFilter');
var DropdownFilter= require('../DropdownFilter/DropdownFilter');

import  SearchFilter  from '../SearchFilter/SearchFilter.js';

module.exports = React.createClass({
    render: function() {
        console.log('FilterComponent search import');
        console.log(SearchFilter);
        return (
            <div className="filter-component">
                <SearchFilter filterText='a'/>
                <DropdownFilter column="Department"/>
                <DropdownFilter column="Volunteer Type"/>
                <DropdownFilter column="Got Ticket"/>
                <DropdownFilter column="Production"/>

             </div>
        );
    }
});