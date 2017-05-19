import React from 'react';
import _ from 'lodash';

export default class DropDownFilter extends React.Component {
    constructor(props) {
        super(props);
        this.handleFilterInputChange = this.handleFilterInputChange.bind(this);
    }

    handleFilterInputChange(e) {
        const value = e.target.value;
        this.props.onFilterInput(value === 'all' ? null : value);
    }

    render() {
        if (!this.props.options) {
            return null;
        }

      const filter = this.props.myFilter || undefined;
        const options = [
            <option value={'all'} key={'all'}>
                All
            </option>
        ];

        options.push(this.props.options.map(function (option) {
            return (
                <option value={option.value} key={option.value}>
                    {option.label}
                </option>);
        }));

        return (
            <div className="filter-component form-group">
                <label htmlFor={this.props.label}>{this.props.label}</label>
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
