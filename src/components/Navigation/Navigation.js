import React from 'react'
import { Link } from 'react-router-dom'

class Navigation extends React.Component{
  render() {
    return (
      <div>
        <ul className="nav nav-tabs">
          <li><Link to="/volunteer-list-tab">Volunteer List</Link></li>
          <li><Link to="/shift-manager">Shift Management</Link></li>
        </ul>
      </div>
    );
  }
}

export default Navigation;
