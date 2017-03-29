import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios';
import update from 'immutability-helper';

import FilterComponent from '../../components/FilterComponent/FilterComponent.js';

import TableComponent from '../../components/TableComponent/TableComponent';

export default class VolunteerListTab extends React.Component {
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
        this.handleRowDelete=this.handleRowDelete.bind(this);
        this.handleRowChange=this.handleRowChange.bind(this);
        this.fetchVolunteers=this.fetchVolunteers.bind(this);
        this.logNetworkError = this.logNetworkError.bind(this);
    }


  componentDidMount(){
    this.fetchVolunteers();
  }

  fetchVolunteers(){
      axios.get('api/v1/volunteers/volunteers')
      .then((res) => this.setState({volunteers:res.data}))
      .catch(logNetworkError);
  }

    logNetworkError(err){
            if(err.response){
                console.log('Data', err.response.data);
                console.log('Status', err.response.status);
                console.log('Headers', err.response.headers);
            }
            else console.log('Error',err.message);
    }

    handleRowDelete(department,profile_id){
        console.log('VolunteerListTab.handleRowDelete');

        axios.delete(`/api/v1/departments/${department}/volunteers/${profile_id}`)
        .then(this.fetchVolunteers)
        .catch( this.logNetworkError);
    }

    handleRowChange(department,profile_id,diff){
        let query=Object.keys(diff).reduce((acc,cur) => acc+`&${cur}=${diff[cur]}`,'').replace('&','?');
        axios.put(`api/v1/departments/${department}/volunteers/${profile_id}`+ query)
        .then(this.fetchVolunteers)
        .catch(this.logNetworkError);
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
                    <TableComponent 
                    volunteers= {this.state.volunteers} 
                    filters= {this.state.filters}
                    onRowDelete= {this.handleRowDelete}
                    onRowChange= {this.handleRowChange}/>
                </div>
            </div>
        );
    }
}