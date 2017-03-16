var React = require('react');
var ReactDOM = require('react-dom');
var FilterComponent = require('../FilterComponent/FilterComponent');
var TableComponent = require('../TableComponent/TableComponent');
import update from 'immutability-helper';


class VolunteerList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
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

    handleFilterTextInput(filterText){
        this.setState((previousState)=>update(previousState,{filters:{$merge:{filterText:filterText}}}));
    }

     handleFilterInput(filterName,value){
     //    console.log('volunteerList.handlefilterinput: )
         let mergeValue={filters:{$merge:{}}};
         mergeValue.filters.$merge[filterName]=value;
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
                    <TableComponent volunteers={this.props.volunteers} filters={this.state.filters}/>
                </div>

            </div>
        );
    }
};


var VOLUNTEERS = [ {
profileId: '123fe',
email: 'zoo@dd.com',
firstName: 'Roe',
lastName: 'Ben-Zeev',
department: 'Medical',
role: 'Manger',
volunteerType: 'Manager',
isProduction: true,
phone: '+67.7.777.7777',
gotTicket: false,
},

{
profileId: '234234',
email: 'abra@kadabra.com',
firstName: 'Abraham',
lastName: 'Ben Hur',
department: 'Mapatz',
role: 'Manger',
volunteerType: 'Department Manager',
isProduction: true,
phone: '+1-222-1222-123',
gotTicket: true,
},

{
profileId: '555555',
email: 'eyal.liebermann@gmail.com',
firstName: 'Eyal Zvi',
lastName: 'Liebermann',
department: 'Navadim',
role: 'Volunteer',
volunteerType: 'Day Manager',
isProduction: false,
phone: '036382020',
gotTicket: true,
},

{
profileId: '11111',
email: 'omerpines@gmail.com',
firstName: 'Omer',
lastName: 'Pines',
department: 'Tech',
role: 'Manger',
volunteerType: 'Production',
isProduction: true,
phone: '054-6501091',
gotTicket: true,
}];

ReactDOM.render(<VolunteerList volunteers={VOLUNTEERS}/>, document.getElementById('react-app'));
