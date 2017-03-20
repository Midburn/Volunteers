import update from 'immutability-helper';
import axios from 'axios';
import React from 'react';
import ReactDom from 'react-dom';

import FilterComponent from '../FilterComponent/FilterComponent.js';

var TableComponent = require('../TableComponent/TableComponent');

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


var VOLUNTEERS = [
   {
      "profile_id": "123fe",
      "email": "zoo@dd.com",
      "first_name": "Roe",
      "last_name": "Cod-Zeev",
      "department": "Medical",
      "role": "Manger",
      "volunteer_type": "Manager",
      "is_production": true,
      "phone": "+67.7.777.7777",
      "got_ticket": false
   },
      {
      "profile_id": "WsDD",
      "email": "guy.weirpool@dd.com",
      "first_name": "Menashe",
      "last_name": "Cen Yakar",
      "department": "Mapatz",
      "role": "Manger",
      "volunteer_type": "Manager",
      "is_production": true,
      "phone": "+67.7.777.7777",
      "got_ticket": false
   },
      {
      "profile_id": "123fe",
      "email": "zoo@segovia.com",
      "first_name": "Jonson",
      "last_name": "Cot-Zeev",
      "department": "Merkazia",
      "role": "Manger",
      "volunteer_type": "Manager",
      "is_production": false,
      "phone": "03=6382020",
      "got_ticket": false
   },
      {
      "profile_id": "123454ABCDe",
      "email": "zoo@google.com",
      "first_name": "Noa",
      "last_name": "Chen",
      "department": "Merkazia",
      "role": "Manger",
      "volunteer_type": "Manager",
      "is_production": false,
      "phone": "(1) - 212 -2223-333",
      "got_ticket": false
   },
   {
      "profile_id": "dupdup",
      "email": "abra@kadabra.com",
      "first_name": "Hava",
      "last_name": "Cotana",
      "department": "Mapatz",
      "role": "Manger",
      "volunteer_type": "Department Manager",
      "is_production": true,
      "phone": "(0)54-5422-235",
      "got_ticket": true
   },
   {
      "profile_id": "dupdup",
      "email": "eyal.liebermann@gmail.com",
      "first_name": "Eyal Zvi",
      "last_name": "Caliberman",
      "department": "Navadim",
      "role": "Volunteer",
      "volunteer_type": "Day Manager",
      "is_production": false,
      "phone": "036382020",
      "got_ticket": true
   },
   {
      "profile_id": "11111",
      "email": "omerpines@gmail.com",
      "first_name": "Omer",
      "last_name": "Cpines",
      "department": "Tech",
      "role": "Manger",
      "volunteer_type": "Production",
      "is_production": true,
      "phone": "054-6501091",
      "got_ticket": true
   }
];
ReactDOM.render(<VolunteerList volunteers={VOLUNTEERS}/>, document.getElementById('react-app'));
