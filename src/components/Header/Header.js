import React from 'react'
import { Link } from 'react-router-dom'

import Navigation from '../Navigation/Navigation';

class Header extends React.Component{
  render() {
    return (
      <div>
        <div>
          <h1>
            <Link to="/">Volunteers - Shift Management</Link>
          </h1>
        </div>
        <div>
          <Navigation />
        </div>
      </div>
    );
  }
}

export default Header;
