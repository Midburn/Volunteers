import ReactDOM from 'react-dom'
import React from 'react'
import axios from 'axios';

import VolunteerList from '../../components/VolunteerList/VolunteerList';

class Dashboard extends React.Component {

  constructor(props) {
    super(props);

    this.state = {volunteers: []};
  }

  componentDidMount(){
      axios.get('api/v1/volunteer/volunteers')
      .then((res) => this.setState({volunteers:res.data}))
      .catch( function(err){
          if(err.response){
              console.log('Data', err.response.data);
              console.log('Status', err.response.status);
              console.log('Headers', err.response.headers);
          }
          else console.log('Error',err.message);
      });
  }

  render () {

    const volunteers = this.state.volunteers;
    return (
      <VolunteerList volunteers={volunteers}/>
    );
  }
}

export default Dashboard;
