import React from 'react';
import axios from 'axios';

export default class AdminView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      admins: []
      }
    }

  componentDidMount() {
    axios.get("permissions/admins")
    .then(admins => {
      this.setState(state => update(state, {admins: {$set:admins}}))
    })
    .catch()

    // TODO: fetch from model???
    // VolunteerRequest.fetchVolunteerRequest()
    //     .then(requests =>
    //         this.setState({
    //             departments: [{_id: "1", nameEn: "Tech"}, {_id: "2", nameEn: "Salon"}, {_id: "3", nameEn: "Fire"}],
    //             requests: requests
    //         }));
  }

  render() {
    const { admins } = this.state;
    if (!admins) 
    return <div>Loading</div>;
    
    return (<div>Admin View</div>);
    // return (
    //     <div className="filter-component form-group">
    //         <label htmlFor={this.props.label}>{this.props.label}</label>
    //         <select
    //             className="form-control"
    //             id={this.props.label}
    //             onChange={this.handleFilterInputChange}
    //             value={filter}
    //         >
    //             {options}
    //         </select>
    //     </div>
    // );
  }
}
