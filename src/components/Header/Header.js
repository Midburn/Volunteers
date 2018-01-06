import React from 'react';
import {Link} from 'react-router-dom';
import {Button} from 'react-bootstrap'
import * as Consts from '../../model/consts';
require('./Header.scss');

class Header extends React.Component {
  render() {
    return (
      <div className="header">
        <a className="logo" href="https://spark.midburn.org">
          <img className="logo-img" src="http://tickets-registration.midburn.org/midburn.png"/>
        </a>
        <div className="header-nav">

          <ul className="nav" style={{display: 'flex', justifyContent: 'center'}}>
          {this.props.routes.map(route => 
            <Link className="nav-btn" key={route.path} to={route.path}>
              <div className="nav-btn-text">{route.name}</div>
            </Link>
          )}
        </ul>
      </div>
      </div>
    );
  }
}

export default Header;
