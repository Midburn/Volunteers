import React from "react";
import ReactDOM from "react-dom";
import {AppContainer} from "react-hot-loader";
import App from "./routes/App";
import ComingSoon from "./components/ComingSoon/ComingSoon";
import axios from "axios";

async function fetchUserDetails() {
    try {
        const response = await axios.get('/api/v1/volunteers/me', {credentials: 'include'});
        document.userDetails = response.data;

        render(App);
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

fetchUserDetails();

if (module.hot) {
    module.hot.accept('./routes/App', () => {
        render(App)
    });
}
