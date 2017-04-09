import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom'

import VolunteerListTab from './VolunteerListTab/VolunteerListTab';
import ShiftManager from './Shifts/ShiftManager';
import Header from '../components/Header/Header';

function App() {

  return (
    <Router>
      <div>
        <Header />
        <Route exact path="/" component={VolunteerListTab}/>
        <Route path="/volunteer-list-tab" component={VolunteerListTab}/>
        <Route path="/shift-manager" component={ShiftManager}/>
      </div>
    </Router>
  );
}

export default App;
