import React from 'react'
import { Link } from 'react-router-dom'

class Navigation extends React.Component{
  render() {
    return (
      <div style={{flex: 1}}>
        <ul className="nav nav-tabs" style={{display: 'flex', justifyContent: 'center'}}>
        {this.props.routes.map(route => 
          <li key={route.path}><Link to={route.path}>{route.name}</Link></li>
        )}
        </ul>
      </div>
    );
  }
}

export default Navigation;
