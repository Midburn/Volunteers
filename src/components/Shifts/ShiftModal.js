import {observer} from "mobx-react"
import React from 'react'
import moment from 'moment'
import {Modal, FormGroup, ControlLabel, FormControl, Button, Table, DropdownButton, MenuItem} from 'react-bootstrap'
import DatePicker from 'react-bootstrap-date-picker'
import _ from 'lodash'

const asHour = d => moment(d).format('H:mm')

const getHours = (date) => 
    new Array(48).fill(0).map(
        (v, i) => (d => <option value={moment(d).format()} key={d}>{asHour(d)}</option>)(moment(date).startOf('day').add(i * 30, 'minutes'))) 

function changeDate(shift, date) {
    const diff = moment(date).startOf('day').diff(moment(shift.startDate).startOf('day'), 'minutes')
    shift.startDate = moment(shift.startDate).add(diff, 'minutes')
    shift.endDate = moment(shift.endDate).add(diff, 'minutes')
}

const ShiftModal = observer(({shift, onSubmit, onCancel, departmentVolunteers}) => (
    shift ? <Modal onHide={onCancel} show={true}>
        <Modal.Header>
            <Modal.Title>{shift.isNew ? 'Create Shift' : "Edit Shift"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <FormGroup controlId="title">
            <ControlLabel>Title</ControlLabel>
            <FormControl componentClass="textarea" rows="1" onChange={e => shift.title = e.target.value} value={shift.title} className="form-control"/>
        </FormGroup>
        <FormGroup controlId="color">
            <ControlLabel>Color</ControlLabel>
            <input type="color" onChange={e => shift.color = e.target.value} value={shift.color} className="form-control"/>
        </FormGroup>
        <FormGroup controlId="date">
            <ControlLabel>Date</ControlLabel>
            <DatePicker value={moment(shift.startDate).format()} onChange={date => changeDate(shift, date)} />
        </FormGroup>
        <FormGroup controlId="startTime">
            <ControlLabel>Start Time</ControlLabel>
            <FormControl componentClass="select" onChange={e => shift.startDate = moment(e.target.value)}
                value={moment(shift.startDate).format()}
                className="form-control" >
                    {getHours(shift.startDate)}
            </FormControl>
        </FormGroup>
        <FormGroup controlId="endTime">
            <ControlLabel>End Time</ControlLabel>
            <FormControl componentClass="select" onChange={e => shift.endDate = moment(e.target.value)}
                value={moment(shift.endDate).format()}
                className="form-control" >
                    {getHours(shift.endDate)}
            </FormControl>
        </FormGroup>

        <FormGroup controlId="volunteers">
            <ControlLabel>Volunteers</ControlLabel>
            <Table striped bordered condensed hover key="table">
                <tbody>
                {shift.volunteers.map((v, i) => 
                    <tr>
                        <td>{`${v.first_name} ${v.last_name}`}</td>
                        <td><Button onClick={() => shift.volunteers = _.without(shift.volunteers, v)}>Delete</Button></td>
                    </tr>)}
                </tbody>
            </Table>
            <DropdownButton id="addVolunteerToShift" title="Add" key="add">
                {_.difference(departmentVolunteers, shift.volunteers).map(v => 
                    <MenuItem onSelect={() => shift.volunteers = [...shift.volunteers, v] }>{v.first_name} {v.last_name}</MenuItem>
                )}
            </DropdownButton>
        </FormGroup>

        </Modal.Body>
        <Modal.Footer>
            <Button onClick={onSubmit}>OK</Button>
            <Button onClick={onCancel}>Cancel</Button>
        </Modal.Footer>
    </Modal>: null
))

export default ShiftModal