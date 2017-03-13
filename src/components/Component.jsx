var React = require('react');
var MyTable = require('./MyTable.jsx');

module.exports = React.createClass({
    _handleCLick: function(){
        alert('you clicked me!');
    },
    render: function() {
        return (
            <html>
                <head>
                    <title>Volunteers | Midburn</title>
                    <link rel="stylesheet" href="/static/css/style.css"/>
                </head>
                <body>
                    <div>
                        <h1>Hello World!</h1>
                        <MyTable />
                    </div> 
                    <script src="/bundle.js" />
                </body>
            </html>
        );
    }
});