var React = require('react');

export default class SearchFilter extends React.Component{
    constructor(props) {
        super(props);
        this.handleFilterTextInputChange = this.handleFilterTextInputChange.bind(this);
  }

   handleFilterTextInputChange(e) {
    this.props.onFilterTextInput(e.target.value);
  }
    render() {
        return (
            <div className="filter-component form-group">
                <label for="search_name">Search</label>
                <input 
                    type="text" 
                    id="search_name" 
                    value={this.props.filterText}
                    onChange={this.handleFilterTextInputChange}
                    className="form-control" 
                    placeholder="Search by user's first name, last name or email" />
            </div>
        );
    }
}
