import React from "react";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import VolunteerListTab from "./VolunteerListTab/VolunteerListTab";
import ShiftManager from "./Shifts/ShiftManager";
import TimeClock from "./TimeClock/TimeClock";
import VolunteerShifts from "../components/VolunteerShifts/VolunteerShifts";
import Header from "../components/Header/Header";
import ComingSoon from "../components/ComingSoon/ComingSoon";
import VolunteerRequest from "../components/VolunteerRequest/VolunteerRequest";

const routesConfig = {
    '1': {
        routes: [
            {
                path: '/volunteer-list-tab',
                component: VolunteerListTab
            },
            {
                path: '/shift-manager',
                component: ShiftManager
            },
            {
                path: '/time-clock',
                component: TimeClock
            },
            {
                path: '/my-shifts',
                component: VolunteerShifts
            },
            {
                path: "/volunteer-requests",
                component: VolunteerRequest
            }
        ],
        defaultComponent: VolunteerListTab
    },
    '2': {
        routes: [
            {
                path: '/volunteer-list-tab',
                component: VolunteerListTab
            },
            {
                path: '/shift-manager',
                component: ShiftManager
            },
            {
                path: '/time-clock',
                component: TimeClock
            },
            {
                path: '/my-shifts',
                component: VolunteerShifts
            }
        ],
        defaultComponent: VolunteerListTab
    },
    '3': {
        routes: [
            {
                path: '/shift-manager',
                component: ShiftManager
            },
            {
                path: '/time-clock',
                component: TimeClock
            },
            {
                path: '/my-shifts',
                component: VolunteerShifts
            }
        ],
        defaultComponent: VolunteerShifts
    }
};

class App extends React.Component {

    render() {
        const role_id = Math.min(...document.roles.map(role => role.permission));
        const routes = routesConfig[role_id];

        if (!routes) {
            return <ComingSoon/>;
        }

        return (
            <Router>
                <div>
                    <Header/>
                    <Switch>
                        {routes['routes'].map(route =>
                            <Route key={route.path} exact path={route.path} component={route.component}/>
                        )}
                        <Route component={routes['defaultComponent']}/>
                    </Switch>
                </div>
            </Router>
        );
    }
}

export default App;
