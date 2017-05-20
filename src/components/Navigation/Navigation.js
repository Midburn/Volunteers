import React from 'react'
import { Link } from 'react-router-dom'

class Navigation extends React.Component{
  render() {
    return (
      <div style={{flex: 1}}>
        <ul className="nav nav-tabs" style={{display: 'flex', justifyContent: 'center'}}>
          <li><Link to="/volunteer-list-tab">Volunteers</Link></li>
          <li><Link to="/shift-manager">Shifts</Link></li>
          <li><Link to="/time-clock">Check In</Link></li>
        </ul>
      </div>
    );
  }
}

export default Navigation;
