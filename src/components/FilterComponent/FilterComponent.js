var React = require('react');

import DropdownFilter from '../DropdownFilter/DropdownFilter.js';
import  SearchFilter  from '../SearchFilter/SearchFilter.js';

module.exports = React.createClass({
    render: function() {
        return (
            <div className="filter-component row">
                <SearchFilter className="col-md-12" filterText={this.props.filters.filterText} onFilterTextInput={this.props.onFilterTextInput}/>
                <DropdownFilter className="col-md-4" label="Department" 
                    onFilterInput={(value)=>this.props.onFilterInput('department',this.convertFromDisplay(value))}
                    options={['All','Tech','Navadim','Mapatz','Tnua','Merkazia']}/>
                <DropdownFilter className="col-md-4" label="Volunteer Type"     
                    onFilterInput={(value)=>this.props.onFilterInput('volunteerType',this.convertFromDisplay(value))}
                    options={['All','Manager','Day Manager','Shift Manager','Production','Department Manager']}/>
                <DropdownFilter lassName="col-md-4" label="Got Ticket" 
                    onFilterInput={(value)=>this.props.onFilterInput('gotTicket',this.convertFromDisplay(value))}
                    options={['All','Yes','No']}/>
                <DropdownFilter lassName="col-md-4" label="Production" 
                onFilterInput={(value)=>this.props.onFilterInput('isProduction',this.convertFromDisplay(value))}
                options={['All','Yes','No']}/>
             </div>
        );
    },

    convertFromDisplay: function(displayValue){
        switch(displayValue){   
            case 'All': return null;
            case 'Yes': return true;
            case 'No': return false;
            default: return displayValue;
    }   
 }
});