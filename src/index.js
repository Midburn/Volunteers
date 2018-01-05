import React from 'react';
import ReactDOM from 'react-dom';
import App from './routes/App';
import ComingSoon from './components/ComingSoon/ComingSoon';
import "./common.scss";

import axios from 'axios';
import {AppContainer} from "react-hot-loader";

async function fetchUserRoles() {
    try {
        const response = await axios.get('api/v1/permissions/me', {credentials: 'include'});
        document.roles = response.data;
        // document.roles = [{departmentId: '42ea4150-e739-11e7-822d-e92efb1d493b',
        //                     permission: 'manager'}];
        return render(App);
    }
    catch (err) {
        console.log(err);
        render(<ComingSoon err={err}/>);
    }
}

const render = (Component) => {
    ReactDOM.render(
        <AppContainer>
            <Component/>
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
