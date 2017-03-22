import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom'

import Dashboard from './Dashboard/Dashboard';
import BulkAdd from './BulkAdd/BulkAdd';
import Header from '../components/Header/Header';

function App() {

  return (
    <Router>
      <div>
        <Header />

        <Route exact path="/" component={Dashboard}/>
        <Route path="/volunteers-list" component={Dashboard}/>
        <Route path="/bulk-add" component={BulkAdd}/>
      </div>
    </Router>
  );
}

export default App;
