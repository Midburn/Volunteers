import update from 'immutability-helper';
import axios from 'axios';
import React from 'react';
import ReactDOM from 'react-dom';

import FilterComponent from '../FilterComponent/FilterComponent.js';

import TableComponent from '../TableComponent/TableComponent';

class VolunteerList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            volunteers:[],
            filters: {
                filterText: '',
                department: null,
                volunteerType: null,
                gotTicket: null,
                isProduction: null
            }
        };
            
        this.handleFilterTextInput = this.handleFilterTextInput.bind(this);
        this.handleFilterInput=this.handleFilterInput.bind(this);
    }
    
    componentDidMount(){
        axios.get('/volunteer/volunteers')
        .then((res) => this.setState({volunteers:res.data}))
        .catch( function(err){
            if(err.response){
                console.log('Data', err.response.data);
                console.log('Status', err.response.status);
                console.log('Headers', err.response.headers);
            }
            else console.log('Error',err.message);  
        });
    }

    handleFilterTextInput(filterText){
        this.handleFilterInput('filterText',filterText);
    }

     handleFilterInput(filterName,value){
         let mergeValue= {
             filters: { 
                 $merge:{
                    [filterName]:value
             }}};
        this.setState((previousState)=>update(previousState,mergeValue));
    }

    render() {
        return (
            <div className="volunteer-list-component">
                <div className="container card">
                    <FilterComponent 
                    filters={this.state.filters} 
                    onFilterTextInput={this.handleFilterTextInput}
                    onFilterInput={this.handleFilterInput}/>
                </div>
                <div className="container card container">
                    <TableComponent volunteers={this.state.volunteers} filters={this.state.filters}/>
                </div>

            </div>
        );
    }
};

ReactDOM.render(<VolunteerList/>, document.getElementById('react-app'));
