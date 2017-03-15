var React = require('react');

module.exports = React.createClass({
    render: function() {
        return (
            <div className="filter-component form-group">
                <label for="department">{this.props.column}</label>
                <select className="form-control" id="department">
                    <option value="all">All</option>
                    <option value="tech">Tech</option>
                    <option value="navadim">Navadim</option>
                    <option value="mapatz">Mapatz</option>
                    <option value="mapatz">Mapatz</option>
                    <option value="tnua">Tnua</option>
                    <option value="merkazia">Merkazia</option>
                </select>
            </div>
        );
    }
});