var React = require('react');

import DropdownFilter from '../DropdownFilter/DropdownFilter.js';
import  SearchFilter  from '../SearchFilter/SearchFilter.js';

module.exports = React.createClass({
    render: function() {
        return (
            <div className="filter-component row">
                <div className="filter-component col-xs-12">
                    <SearchFilter filterText={this.props.filters.filterText} onFilterTextInput={this.props.onFilterTextInput}/>
                </div>
                <div className="col-md-4 col-xs-12">
                    <DropdownFilter label="Department" 
                        onFilterInput={(value)=>this.props.onFilterInput('department',this.convertFromDisplay(value))}
                        options={['All','Tech','Navadim','Mapatz','Tnua','Merkazia']}/>
                </div>
                <div className="col-md-4 col-xs-12">
                    <DropdownFilter className="col-md-4 col-xs-12" label="Volunteer Type"     
                        onFilterInput={(value)=>this.props.onFilterInput('volunteerType',this.convertFromDisplay(value))}
                        options={['All','Manager','Day Manager','Shift Manager','Production','Department Manager']}/>
                </div>
                <div className="col-md-4 col-xs-12">
                    <DropdownFilter lassName="col-md-4 col-xs-12" label="Got Ticket" 
                        onFilterInput={(value)=>this.props.onFilterInput('gotTicket',this.convertFromDisplay(value))}
                        options={['All','Yes','No']}/>
                </div>
                <div className="col-md-4 col-xs-12">
                    <DropdownFilter lassName="col-md-4 col-xs-12" label="Production" 
                        onFilterInput={(value)=>this.props.onFilterInput('isProduction',this.convertFromDisplay(value))}
                        options={['All','Yes','No']}/>
                </div>
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