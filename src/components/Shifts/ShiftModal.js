import {observer} from "mobx-react";
import React from 'react';
import moment from 'moment';
import {Modal, FormGroup, ControlLabel, FormControl, Button, Table, DropdownButton, MenuItem} from 'react-bootstrap';
import DatePicker from 'react-bootstrap-date-picker';
import {Typeahead} from 'react-bootstrap-typeahead';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import _ from 'lodash';

const asHour = d => moment(d).format('H:mm')

const getHours = (date) =>
  new Array(48).fill(0).map(
    (v, i) => (d => <option value={moment(d).format()}
                            key={d}>{asHour(d)}</option>)(moment(date).startOf('day').add(i * 30, 'minutes')))

function changeStartDate(shift, date) {
  const diff = moment(date).startOf('day').diff(moment(shift.startDate).startOf('day'), 'minutes')
  shift.startDate = moment(shift.startDate).add(diff, 'minutes')
}

function changeEndDate(shift, date) {
  const diff = moment(date).startOf('day').diff(moment(shift.endDate).startOf('day'), 'minutes')
  shift.endDate = moment(shift.endDate).add(diff, 'minutes')
}

const ShiftModal = observer(({shift, onSubmit, onCancel, departmentVolunteers}) => {
  return shift ? 
    <Modal onHide={onCancel} show={true}>
      <Modal.Header>
        <Modal.Title>{shift.isNew ? 'Create Shift' : "Edit Shift"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormGroup controlId="title">
          <ControlLabel>Title</ControlLabel>
          <FormControl componentClass="textarea" rows="1" onChange={e => shift.title = e.target.value}
                       value={shift.title} className="form-control"/>
        </FormGroup>
        <FormGroup controlId="color">
          <ControlLabel>Color</ControlLabel>
          <input type="color" onChange={e => shift.color = e.target.value} value={shift.color}
                 className="form-control"/>
        </FormGroup>
        <FormGroup controlId="startTime">
          <ControlLabel>Start Time</ControlLabel>
          <DatePicker value={moment(shift.startDate).format()} dateFormat="DD/MM/YYYY"
                      onChange={date => changeStartDate(shift, date)}/>
          <FormControl componentClass="select" onChange={e => shift.startDate = moment(e.target.value)}
                       value={moment(shift.startDate).format()}
                       className="form-control">
            {getHours(shift.startDate)}
          </FormControl>
        </FormGroup>
        <FormGroup controlId="endTime">
          <ControlLabel>End Time</ControlLabel>
          <DatePicker value={moment(shift.endDate).format()} dateFormat="DD/MM/YYYY"
                      onChange={date => changeEndDate(shift, date)}/>
          <FormControl componentClass="select" onChange={e => shift.endDate = moment(e.target.value)}
                       value={moment(shift.endDate).format()}
                       className="form-control">
            {getHours(shift.endDate)}
          </FormControl>
        </FormGroup>

        <FormGroup controlId="volunteers">
          <ControlLabel>Volunteers</ControlLabel>
          <Select multi simpleValue
                  value={shift.volunteers && shift.volunteers.map(volunteer => volunteer.userId).join(',')}
                  options={departmentVolunteers.map(volunteer => ({
                    value: volunteer._id.toString(),
                    label: `${volunteer.sparkInfo.firstName} ${volunteer.sparkInfo.lastName}`,
                    profile: volunteer.userId
                  }))}
                  onChange={selectedVolunteerProfileIds => {
                    shift.volunteers = selectedVolunteerProfileIds.split(',').map(id => {
                      const data = {
                        userId: id,
                        isCheckedIn: null,
                        comment: ''
                      }
                      return data;
                    })
                  }}
                  filterOption={(object, filter) =>Object.keys(object).some((element, index, array) => object[element] && object[element].toLowerCase().includes(filter))
                  }/>
        </FormGroup>

      </Modal.Body>
      <Modal.Footer>
        <Button bsStyle="success" onClick={onSubmit}>OK</Button>
        <Button onClick={onCancel}>Cancel</Button>
      </Modal.Footer>
    </Modal> : null
})

export default ShiftModal