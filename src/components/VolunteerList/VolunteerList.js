import update from 'immutability-helper';

var React = require('react');
var ReactDOM = require('react-dom');
var FilterComponent = require('../FilterComponent/FilterComponent');
var TableComponent = require('../TableComponent/TableComponent');

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
                    <TableComponent volunteers={this.props.volunteers} filters={this.state.filters}/>
                </div>

            </div>
        );
    }
};

export default VolunteerList;
