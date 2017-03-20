import React from 'react';

// css requires
require('./ResetButtonComponent.css')

export default class ResetButtonComponent extends React.Component{
    constructor(props){
        super(props);
        this.handleResetClick = this.handleResetClick.bind(this);
    }

    handleResetClick(e){
        this.props.onFilterInput();
    }

    render() {
        return (
            <div className="reset-button">
                <button className="btn btn-primary" onClick={this.handleResetClick}>Clear Filters</button>
           </div>
        );
    }
}
