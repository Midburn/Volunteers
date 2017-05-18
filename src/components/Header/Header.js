import React from 'react';
import {Link} from 'react-router-dom';
import Navigation from '../Navigation/Navigation';

class Header extends React.Component {
  render() {
    return (
      <div>
        <div>
          <a href="https://spark.midburn.org">
            <h4>Back to Spark</h4>
          </a>
          <h3>
            <Link to="/">Volunteers - Shift Management</Link>
          </h3>
        </div>
        <div>
          <Navigation />
        </div>
      </div>
    );
  }
}

export default Header;
