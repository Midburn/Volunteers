import React from 'react'
import { Link } from 'react-router-dom'

class Navigation extends React.Component{
  render() {

    const role_id = document.roles[0].permission;

    return (
      <div style={{flex: 1}}>
        <ul className="nav nav-tabs" style={{display: 'flex', justifyContent: 'center'}}>
          {((role_id === 'admin') || (role_id === 2)) && <li><Link to="/volunteer-list-tab">Volunteer List</Link></li>}
          <li><Link to="/shift-manager">Shift Management</Link></li>
          <li><Link to="/time-clock">Time Clock</Link></li>
          <li><Link to="/my-shifts">My shifts</Link></li>
          <li><Link to="/volunteer-requests">Requests</Link></li>
          <li><Link to="/admin">Admin</Link></li>
        </ul>
      </div>
    );
  }
}

export default Navigation;
