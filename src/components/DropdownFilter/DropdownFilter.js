var React = require('react');

export default class DropDownFilter extends React.Component{
    constructor(props){
        super(props);
    }
    
    render() {
           var options = this.props.options.map(function(option){
               return (<option value="{option}">{option}</option>);
           });
        return (
           
            <div className="filter-component form-group">
                <label for="department">{this.props.label}</label>
                <select className="form-control" id="department">
                {options}
                </select>
            </div>
        );
    }
}
