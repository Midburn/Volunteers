import React from "react";
import {BrowserRouter as Router, Route} from "react-router-dom";
import Header from "../components/Header/Header";
import VolunteerListTab from "./VolunteerListTab/VolunteerListTab";
import ShiftManager from "./Shifts/ShiftManager";
import TimeClock from "./TimeClock/TimeClock";

class App extends React.Component {

    render() {
        return (
            <Router>
                <div>
                    <Header />
                    <Route exact path="/" component={VolunteerListTab}/>
                    <Route path="/volunteer-list-tab" component={VolunteerListTab}/>
                    <Route path="/shift-manager" component={ShiftManager}/>
                    <Route path="/time-clock" component={TimeClock}/>
                </div>
            </Router>
        );
    }
}

export default App;
