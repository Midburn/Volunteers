import React from 'react';
import ReactDOM from 'react-dom';
import {AppContainer} from 'react-hot-loader';
import App from './routes/App';
import ComingSoon from './components/ComingSoon/ComingSoon';
import VolunteerShifts from "./components/VolunteerShifts/VolunteerShifts";
import "./common.scss";

import axios from 'axios';

async function fetchUserRoles() {
  // todo: fix /me
  document.roles = [{permission: 1}];
  return render(App);
  try {
    const response = await axios.get('/permissions/me', {credentials: 'include'});
    if (response.data.length > 0) {
      document.roles = response.data;
      if (document.roles.find(role => role.permission === 'admin')) {
        return render(App);        
      }
    }
    return render(<ComingSoon/>);
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
