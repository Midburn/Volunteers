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
                <SearchFilter filterText={this.props.filters.filterText} onFilterTextInput={this.props.onFilterTextInput}/>
                <DropdownFilter label="Department" options={['All','Tech','Navadim','Mapatz','Tnua','Merkazia']}/>
                <DropdownFilter label="Volunteer Type" options={['All','Manager','Day Manager','Shift Manager','Production','Department Manager']}/>
                <DropdownFilter label="Got Ticket" options={['All','Yes','No']}/>
                <DropdownFilter label="Production" options={['All','Yes','No']}/>
             </div>
        );
    }
});