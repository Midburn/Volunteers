var React = require('react');

module.exports = React.createClass({
    render: function() {
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
});
