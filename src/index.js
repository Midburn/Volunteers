import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import { AppContainer } from 'react-hot-loader';

import App from './routes/App'
import ComingSoon from './components/ComingSoon/ComingSoon'

const fetchUserData = async function() {
    try {
      const resp = await axios.get('/api/v1/volunteers/me', {credentials: 'include'});
      console.log(JSON.stringify(resp));
      render(App);
    } catch(error) {
      console.log(error);
      render(ComingSoon);
    }
};

const render = (Component) => {
  ReactDOM.render(
    <AppContainer>
      <Component/>
    </AppContainer>,
    document.getElementById('root')
  );
};

//render(App);
fetchUserData();

if (module.hot) {
  module.hot.accept('./routes/App', () => {
    render(App)
  });
}
