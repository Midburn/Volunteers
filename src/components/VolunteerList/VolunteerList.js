var React = require('react');
var ReactDOM = require('react-dom');
var FilterComponent = require('../FilterComponent/FilterComponent');
var TableComponent = require('../TableComponent/TableComponent');

class VolunteerList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            filters: {
                filterText: 'a',
                department: null,
                volunteerType: null,
                gotTicket: null,
                isProduction: null
            }
        };
            
        this.handleFilterTextInput = this.handleFilterTextInput.bind(this);
    }

    handleFilterTextInput(filterText){
        this.setState({filters:{filterText:filterText}});
    }

    render() {
        return (
            <div className="volunteer-list-component">
                <div className="container card">
                    <FilterComponent filters={this.state.filters} onFilterTextInput={this.handleFilterTextInput}/>
                </div>
                <div className="container card">
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
department: 'fun',
role: 'Manger',
volunteerType: 'Manager',
isProduction: true,
phone: '+1-222-1222-123',
gotTicket: true,
},

{
profileId: '555555',
email: 'eyal.liebermann@gmail.com',
firstName: 'Eyal Zvi',
lastName: 'Liebermann',
department: 'Midbrun Tech',
role: 'Volunteer',
volunteerType: 'Volunteer',
isProduction: false,
phone: '036382020',
gotTicket: true,
},

{
profileId: '11111',
email: 'omerpines@gmail.com',
firstName: 'Omer',
lastName: 'Pines',
department: 'Midburn Tech',
role: 'Manger',
volunteerType: 'Manager',
isProduction: true,
phone: '054-6501091',
gotTicket: true,
}];

ReactDOM.render(<VolunteerList volunteers={VOLUNTEERS}/>, document.getElementById('react-app'));
