import React from 'react';
import {Link} from 'react-router-dom';
import Navigation from '../Navigation/Navigation';

class Header extends React.Component {
  render() {
    return (
      <div style={{display: 'flex'}}>
          <a href="https://spark.midburn.org"><img height="40" src="https://spark.midburn.org/images/midburn_logo_120.png" /></a>
        <Navigation />
      </div>
    );
  }
}

export default Header;
