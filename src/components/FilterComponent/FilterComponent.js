import React from 'react';

import DropdownFilter from '../DropdownFilter/DropdownFilter.js';
import SearchFilter  from '../SearchFilter/SearchFilter.js';
import ResetButtonComponent  from '../ResetButtonComponent/ResetButtonComponent.js';
import DropdownConverter from '../../DropdownConverter.js'

export default class FilterComponent extends React.Component{
    constructor(props){ 
        super(props);
        this.onResetClick = this.onResetClick.bind(this);
    }

    render() {
        let Convert = new DropdownConverter();
        return (
            <div className="filter-component row">
                <div className="filter-component col-xs-12">
                    <SearchFilter filterText={this.props.filters.filterText} onFilterTextInput={this.props.onFilterTextInput}/>
                </div>
                <div className="col-md-4 col-xs-12">
                    <DropdownFilter label="Department" 
                        onFilterInput={(value)=>this.props.onFilterInput('department',Convert.convertFromDisplay(value))}
                        options={['All','Tech','Navadim','Mapatz','Tnua','Merkazia']}
                        myFilter={Convert.convertToDisplay(this.props.filters.department)}/>
                </div>
                <div className="col-md-4 col-xs-12">
                    <DropdownFilter label="Volunteer Type"     
                        onFilterInput={(value)=>this.props.onFilterInput('volunteerType',Convert.convertFromDisplay(value))}
                        options={['All','Manager','Day Manager','Shift Manager','Production','Department Manager']}
                        myFilter={Convert.convertToDisplay(this.props.filters.volunteerType)}/>
                </div>
                <div className="col-md-4 col-xs-12">
                    <DropdownFilter label="Got Ticket" 
                        onFilterInput={(value)=>this.props.onFilterInput('gotTicket',Convert.convertFromDisplay(value))}
                        options={['All','Yes','No']}
                        myFilter={Convert.convertToDisplay(this.props.filters.gotTicket)}/>
                </div>
                <div className="col-md-4 col-xs-12">
                    <DropdownFilter label="Production" 
                        onFilterInput={(value)=>this.props.onFilterInput('isProduction',Convert.convertFromDisplay(value))}
                        options={['All','Yes','No']}
                        myFilter={Convert.convertToDisplay(this.props.filters.isProduction)}/>
                </div>
                <div className="col-md-4 col-md-offset-4 col-xs-12">
                    <ResetButtonComponent onFilterInput={this.onResetClick} />
                </div>
             </div>
        );
    }

   

    onResetClick(){
        this.props.onFilterInput('department',null);
        this.props.onFilterInput('volunteerType',null);
        this.props.onFilterInput('gotTicket', null);
        this.props.onFilterInput('isProduction',null);
        this.props.onFilterTextInput('');
    }   
}

