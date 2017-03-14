var React = require('react');
var ReactDOM = require('react-dom');
var FilterComponent = require('../FilterComponent/FilterComponent');
var TableComponent = require('../TableComponent/TableComponent');

class VolunteerList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tableData: {},
            filters: {
                searchText: '',
                department: '',
                volunteerType: '',
                gotTicket: null,
                isProduction: null
            }
        };
    }
    render() {
        return (
            <div className="volunteer-list-component">
                <div className="row card">
                    <FilterComponent />
                </div>
                <div className="row card">
                    <TableComponent />
                </div>
            </div>
        );
    }
};

ReactDOM.render(<VolunteerList />, document.getElementById('react-app'));