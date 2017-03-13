var React = require('react');
var TableHeader = require('./TableHeader.jsx');
var TableBody = require('./TableBody.jsx');

module.exports = React.createClass({
    render: function() {
        return (
            <table>
                <TableHeader />
                <TableBody />
            </table>
        );
    }
})