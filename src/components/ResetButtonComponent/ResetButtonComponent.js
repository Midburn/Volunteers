var React = require('react');

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
                <button className="btn btn-default" onClick={this.handleResetClick}>Clear Search</button>
           </div>
        );
    }
}
