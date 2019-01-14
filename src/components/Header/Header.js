import React from 'react';
import {Link } from 'react-router-dom';
import Select from 'react-select';
import axios from 'axios';
require('./Header.scss');

class Header extends React.Component {

  changeEvent = event => {
    axios.post("/api/v1/events/change", { event: event.value })
            .then(() => location.reload())
  }

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
        <Select id="eventChange"  clearable={false} searchable={false}
                value={document.events.current}
                onChange={this.changeEvent}
                options={document.events.events.map(event => { return { value: event, label: event} })}
                disabled={!document.events.canChange}
        />
    </div>
    );
  }
}

export default Header;
