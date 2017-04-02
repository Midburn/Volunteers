import React from 'react';
import ReactDOM from 'react-dom';

import { AppContainer } from 'react-hot-loader';

import App from './routes/App'
import ComingSoon from './components/ComingSoon/ComingSoon'

const fetchUserData = async function() {
    const resp = await fetch('/api/v1/volunteer/me', {credentials: 'include'});
    const me = await resp.json();
    console.log(JSON.stringify(me));
    if (me.length > 0) {
        render(App);
    } else {
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
