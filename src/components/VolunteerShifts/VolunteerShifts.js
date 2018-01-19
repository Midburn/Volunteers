import React from 'react';
import moment from 'moment';
import {ListGroup, ListGroupItem, DropdownButton, MenuItem, Button} from 'react-bootstrap';
import axios from 'axios';

require('./VolunteerShifts.scss');

export default class VolunteerShifts extends React.Component {

  constructor(props) {
    super(props);

    this.state = {shifts: {}, departments: []};

    this.fetchDepartments = this.fetchDepartments.bind(this)
    this.fetchShifts = this.fetchShifts.bind(this)
  }

  componentDidMount() {
    // this.fetchDepartments();
    // this.fetchShifts();
  }

  fetchDepartments = () => {
    axios.get('/api/v1/departments')
      .then((res) => {
        const departments = res.data.sort((a, b) => a.name.localeCompare(b.name));
        this.setState({
          departments: departments
        });
      })
      .catch(this.logNetworkError);
  };

  fetchShifts() {
    const departments = document.roles.map(role => role.department_id);

    for (let index = 0; index < departments.length; index++) {
      axios.get(`/api/v1/departments/${departments[index]}/shifts/me`, {credentials: 'include'}).then(response => {
        const shifts = this.state.shifts;
        shifts[departments[index]] = response.data;
        this.setState({shifts: shifts});
      });
    }
  }

  render() {
    return <div className="volunteer-shifts">
        {Object.keys(this.state.shifts).map(shiftsDepartment => {
          if (!this.state.shifts[shiftsDepartment].length) {
            return null;
          }

          return <ListGroup key={shiftsDepartment}>
            <ListGroupItem bsClass="department">{(this.state.departments.find(department => department.id == shiftsDepartment) || {name: 'Loading...'}).name}</ListGroupItem>
            {this.state.shifts[shiftsDepartment].sort((a, b) => a.startDate - b.startDate).map(shift =>
              <ListGroupItem bsClass={moment(shift.startDate).isBefore(new Date()) ? "shift passed" : "shift"}
                             key={shift._id}>
                <div className="details">
                  <div className="shift-color" style={{backgroundColor: shift.color}}></div>
                  <span className="title">{`${shift.title},`}</span>
                  <span>{`${moment(shift.startDate).format('D/M/YY, k:mm')} (${moment(shift.startDate).fromNow()})`}</span>
                </div>
                <div className="comment">{shift.comment}</div>
              </ListGroupItem>
            )}
          </ListGroup>
        })}
      </div>;
  }
}