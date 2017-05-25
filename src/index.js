import React from 'react';
import ReactDOM from 'react-dom';
import {AppContainer} from 'react-hot-loader';
import App from './routes/App';
import ComingSoon from './components/ComingSoon/ComingSoon';
import VolunteerShifts from "./components/VolunteerShifts/VolunteerShifts";

import axios from 'axios';

async function fetchUserRoles() {
  try {
    const response = await axios.get('/api/v1/volunteers/roles/me', {credentials: 'include'});
    if (response.data.length > 0) {

      document.roles = response.data;

      if (!document.roles.some(role => role.permission < 4)) {
          return render(VolunteerShifts);
      }

      return render(App);
    }

    return window.location('https://spark.midburn.org');
  }
  catch (err) {
    console.log(err);

    render(<ComingSoon err={err}/>);
  }
}

const render = (Component) => {
  ReactDOM.render(
    <AppContainer>
      <Component />
    </AppContainer>,
    document.getElementById('root')
  );
};

fetchUserRoles();

if (module.hot) {
  module.hot.accept('./routes/App', () => {
    render(App)
  });
}
