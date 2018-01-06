import React from 'react';
import {Link} from 'react-router-dom';

class Header extends React.Component {
  render() {
    return (
      <div style={{display: 'flex'}}>
        <a href="https://spark.midburn.org"><img height="40" src="https://spark.midburn.org/images/midburn_logo_120.png" /></a>
        <div style={{flex: 1}}>
          <ul className="nav nav-tabs" style={{display: 'flex', justifyContent: 'center'}}>
          {this.props.routes.map(route => 
            <li key={route.path}><Link to={route.path}>{route.name}</Link></li>
          )}
        </ul>
      </div>
      </div>
    );
  }
}

export default Header;
