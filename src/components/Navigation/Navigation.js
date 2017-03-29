import React from 'react'
import { Link } from 'react-router-dom'

class Navigation extends React.Component{
  render() {
    return (
      <div>
        <ul className="nav nav-tabs">
          <li><Link to="/volunteers-list-tab">Volunteers List</Link></li>
          <li><Link to="/bulk-add">Bulk Add</Link></li>
        </ul>
      </div>
    );
  }
}

export default Navigation;
