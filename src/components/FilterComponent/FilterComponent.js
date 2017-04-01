import React from 'react';

import DropdownFilter from '../DropdownFilter/DropdownFilter.js';
import SearchFilter  from '../SearchFilter/SearchFilter.js';
import ResetButtonComponent  from '../ResetButtonComponent/ResetButtonComponent.js';
import DropdownConverter from '../../DropdownConverter.js';
import VolunteerAddModal from '../VolunteerAddModal/VolunteerAddModal.js';

import { Button } from 'react-bootstrap';

export default class FilterComponent extends React.Component{
    constructor(props){ 
        super(props);
        this.state={
            add:false
        };
        this.onResetClick = this.onResetClick.bind(this);
        this.handleAdddModal= this.handleAdddModal.bind(this);
        this.handleHide=this.handleHide.bind(this);
    }

    handleAdddModal(){
        this.setState({add:true});
    }

    handleHide(){
        this.setState({add:false});
    }

    onResetClick(){
        this.props.onFilterInput('department',null);
        this.props.onFilterInput('role',null);
        this.props.onFilterInput('gotTicket', null);
        this.props.onFilterInput('isProduction',null);
        this.props.onFilterTextInput('');
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
                    <DropdownFilter label="Volunteer Role"     
                        onFilterInput={(value)=>this.props.onFilterInput('role',Convert.convertFromDisplay(value))}
                        options={this.props.roles.map((role)=>role.name)}
                        myFilter={Convert.convertToDisplay(this.props.filters.role)}/>
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
                <div className="col-md-4 col-xs-12">
                    <Button onClick={this.handleAdddModal}> Add Volunteer </Button>
                </div>
                <div className="col-md-4 col-xs-12">
                    <ResetButtonComponent onFilterInput={this.onResetClick} />
                </div>
                <VolunteerAddModal 
                    show={!!this.state.add} 
                    onHide={this.handleHide} 
                    onSubmit={this.props.onVolunteerSubmit} />
             </div>
        );
    }   
}

