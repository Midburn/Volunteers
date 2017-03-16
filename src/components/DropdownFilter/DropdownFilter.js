var React = require('react');

export default class DropDownFilter extends React.Component{
    constructor(props){
        super(props);
        this.handleFilterInputChange = this.handleFilterInputChange.bind(this);
    }

    handleFilterInputChange(e){
        this.props.onFilterInput(e.target.value);
    }

    render() {
           var options = this.props.options.map(function(option){
               return (
                    <option value={option} key={option}>
                        {option}
                    </option>);
           });
        return (
           
            <div className="filter-component form-group">
                <label htmlFor="department">{this.props.label}</label>
                <select 
                className="form-control" 
                id="department"
                onChange={this.handleFilterInputChange} 
                >
                {options}
                </select>
            </div>
        );
    }
}
