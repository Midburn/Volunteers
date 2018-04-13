import React from "react";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import * as Permissions from "../model/permissionsUtils"
import VolunteerListTab from "../components/VolunteerTab/VolunteerListTab";
import ShiftManager from "./Shifts/ShiftManager";
import TimeClock from "./TimeClock/TimeClock";
import VolunteerShifts from "../components/VolunteerShifts/VolunteerShifts";
import Header from "../components/Header/Header";
import ComingSoon from "../components/ComingSoon/ComingSoon";
import VolunteerRequest from "../components/VolunteerRequest/VolunteerRequest";
import AdminView from "../components/Admin/AdminView";

class App extends React.Component {

  routes = roles => {
    const routes = [];
    const isAdmin = Permissions.isAdmin();
    const isManager = Permissions.isManager();
    const isVolunteer = Permissions.isVolunteer();

    routes.push({ name:'Join', path:'/volunteer-requests',component: VolunteerRequest });

    if (isAdmin || isManager) {
      routes.push({ name:'Volunteers', path: '/volunteer-list-tab',component: VolunteerListTab });
    }

    if (isAdmin || isManager) {
      routes.push({ name:'Shifts', path: '/shift-manager',component: ShiftManager });
    }

    // if (isAdmin || isManager) {
    //   routes.push({ name:'Shifts Managment', path: '/time-clock',component: TimeClock });
    // }

    // if (isAdmin || isManager || isVolunteer) {
    //   routes.push({ name:'My Shifts', path: '/my-shifts',component: VolunteerShifts });
    // }

    if (isAdmin || isManager) {
      routes.push({ name:'Admin', path:'/admin',component: AdminView });
    }

    return routes;
  }

    render() {
        const routes = this.routes(document.roles)
        if (!routes) {
            return <ComingSoon/>;
        }

        return (
            <Router>
                <div>
                    <Header routes={routes}/>
                    <Switch>
                        {routes.map(route =>
                            <Route key={route.path} exact path={route.path} component={route.component}/>
                        )}
                        <Route component={routes[0].component}/>
                    </Switch>
                </div>
            </Router>
        );
    }
}

export default App;
