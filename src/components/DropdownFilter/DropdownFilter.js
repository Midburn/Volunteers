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
        var filter = this.props.myFilter;
        var options = this.props.options.map(function(option){
            return (
                <option value={option} key={option}>
                    {option}
                </option>);
            });
        return (
           
            <div className="filter-component form-group">
                {this.props.editMode || (<label htmlFor="department">{this.props.label}</label>)}
                <select 
                className="form-control" 
                id={this.props.label}
                onChange={this.handleFilterInputChange}
                value={filter} 
                >
                {options}
                </select>
            </div>
        );
    }
}
