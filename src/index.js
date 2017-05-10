import React from "react";
import ReactDOM from "react-dom";
import {AppContainer} from "react-hot-loader";
import App from "./routes/App";
import ComingSoon from "./components/ComingSoon/ComingSoon";
import axios from "axios";
import TimeClock from "./routes/TimeClock/TimeClock";

async function fetchUserRoles() {
    try {
        const response = await axios.get('/api/v1/volunteers/roles/me', {credentials: 'include'});
        if(response.data.length > 0){
            const isAdmin = response.data.some( (item) => item.permission < 2)
            if (isAdmin) {
                document.roles = response.data;
                render(App);
                return;
            }

            const isShiftManager = response.data.some( (item) => item.permission < 4)
            if (isShiftManager) {
                document.roles = response.data;
                render(TimeClock);
                return;  
            }
        }
        render(ComingSoon);
    }
    catch(err) {
        console.log(err);
        render(ComingSoon);
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
