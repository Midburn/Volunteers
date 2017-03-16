var React = require('react');

import DropdownFilter from '../DropdownFilter/DropdownFilter.js';
import  SearchFilter  from '../SearchFilter/SearchFilter.js';

module.exports = React.createClass({
    render: function() {
        return (
            <div className="filter-component row">
                <SearchFilter className="col-md-12" filterText={this.props.filters.filterText} onFilterTextInput={this.props.onFilterTextInput}/>
                <DropdownFilter className="col-md-4" label="Department" options={['All','Tech','Navadim','Mapatz','Tnua','Merkazia']}/>
                <DropdownFilter className="col-md-4" label="Volunteer Type" options={['All','Manager','Day Manager','Shift Manager','Production','Department Manager']}/>
                <DropdownFilter lassName="col-md-4" label="Got Ticket" options={['All','Yes','No']}/>
                <DropdownFilter lassName="col-md-4" label="Production" options={['All','Yes','No']}/>
             </div>
        );
    }
});