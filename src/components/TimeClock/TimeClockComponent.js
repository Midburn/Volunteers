import React from 'react';
import {observer} from 'mobx-react';
import moment from 'moment'
import {ListGroup, ListGroupItem, DropdownButton, MenuItem, Button} from 'react-bootstrap'
import Header from "../Header/Header";

require('./TimeClock.scss');

const TimeClockComponent = observer(({shiftManagerModel}) => {

  if (!shiftManagerModel.currentShift) {
    return <div className="time-clock">
      <Header />
      <div className="shift-list">
        <DropdownButton id="departments"
                        title={shiftManagerModel.departmentID ? `Department: ${shiftManagerModel.departmentName}` : 'Select Department'}
                        value={shiftManagerModel.departmentID || 0}>
          {shiftManagerModel.departments.map(({id, name}) => <MenuItem key={id}
                                                                       onSelect={() => shiftManagerModel.departmentID = id}>{name}</MenuItem>)}
        </DropdownButton>
        <ListGroup>
          {shiftManagerModel.filteredShifts.sort().map(shift =>
            <ListGroupItem key={shift.id} onClick={() => shiftManagerModel.currentShift = shift}>
              <div className="shift-color" style={{backgroundColor: shift.color}}></div>
              <span
                className="badge">{`${shift.volunteers ? Object.keys(shift.volunteers).filter(volunteerId => !!shift.volunteers[volunteerId].isCheckedIn).length : 0}/${_.size(shift.volunteers)}`}</span>
              {`${shift.title}, ${moment(shift.startDate).format('D/M/YY, k:mm')} (${moment(shift.startDate).fromNow()})`}
            </ListGroupItem>
          )}
        </ListGroup>
      </div>
    </div>;
  }

  const volunteerDisplayMap = Object.keys(shiftManagerModel.currentShift.volunteers).reduce((acc, volunteerId, index) => {
    const currentVolunteer = shiftManagerModel.volunteers.find(volunteer => volunteerId === volunteer.profile_id.toString());
    acc[volunteerId] = `${currentVolunteer.first_name} ${currentVolunteer.last_name}`;
    return acc;
  }, {});

  return <div className="time-clock">
    <Header />
    <div className="shift-details">
      <ul className="breadcrumb">
        <li>
          <a href="#"
             onClick={() => shiftManagerModel.currentShift = null}>{shiftManagerModel.departmentName}</a>
        </li>
        <li className="active">
          {shiftManagerModel.currentShift.title}, {moment(shiftManagerModel.currentShift.startDate).calendar()}
        </li>
      </ul>
      <textarea className="shift-comment" placeholder='הערות אחמ"ש למשמרת'
                value={shiftManagerModel.currentShift.comment}
                onChange={event => {
                  shiftManagerModel.currentShift.comment = event.target.value;
                }}/>
      <ListGroup>
        <ListGroupItem bsClass="volunteers-list">
          <Button onClick={e =>
            shiftManagerModel.submitShift({close: false})}>Save
          </Button>
          {Object.keys(shiftManagerModel.currentShift.volunteers).map(volunteerId => {
            const volunteer = shiftManagerModel.currentShift.volunteers[volunteerId];

            return <div className="form-group" key={volunteerId}>
              <label>
                {volunteerDisplayMap[volunteerId]}
                <input
                  type="checkbox" defaultChecked={!!volunteer.isCheckedIn}
                  onChange={event => {
                    volunteer.isCheckedIn = volunteer.isCheckedIn ? null : new Date();
                  }}/>
              </label>
              <input type="text"
                     value={volunteer.comment}
                     onChange={event => {
                       volunteer.comment = event.target.value;
                     }}/>
            </div>;
          })}
          <Button onClick={e =>
            shiftManagerModel.submitShift({close: false})}>Save
          </Button>
        </ListGroupItem>
      </ListGroup>
    </div>
  </div>
});

export default TimeClockComponent;