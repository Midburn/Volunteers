var React = require('react');
var ReactDOM = require('react-dom');
var FilterComponent = require('./FilterComponent');
var TableComponent = require('./TableComponent');

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
                <FilterComponent />
                <TableComponent />
            </div>
        );
    }
};

ReactDOM.render(<VolunteerList />, document.getElementById('react-app'));