import React from 'react';
import {observer} from 'mobx-react';
import moment from 'moment'
import {ListGroup, ListGroupItem, DropdownButton, MenuItem, Button} from 'react-bootstrap'

require ('./TimeClock.scss');

const TimeClockComponent = observer(({shiftManagerModel}) =>(
    <div className="time-clock">
        {shiftManagerModel.currentShift ? <div className="shift-details">
            <nav className="navbar navbar-default">
            <div className="container-fluid">
                <div className="navbar-header">
                <Button className="navbar-brand glyphicon glyphicon-chevron-left" href="#" onClick={() => shiftManagerModel.currentShift = null} />
                {shiftManagerModel.currentShift.title}, {moment(shiftManagerModel.currentShift.startDate).calendar()}
                </div>
            </div>
            </nav>          
            <ListGroup>
                <ListGroupItem>
                {_.compact(shiftManagerModel.currentShift.volunteers).map(v => 
                <div className="checkbox" key={v.profile_id}>
                    <label>
                        <input checked={_.includes(shiftManagerModel.currentShift.reported, '' + v.profile_id)}
                            type="checkbox" value={'' + v.profile_id} 
                            onChange={({target}) => {
                                shiftManagerModel.currentShift.reported = 
                                    _.compact(_.uniq(target.checked ? 
                                        [...(shiftManagerModel.currentShift.reported || []), target.value] :
                                        _.remove(shiftManagerModel.currentShift.reported, target.value)));
                            }
                             } /> {v.first_name} {v.last_name}
                    </label>
                </div>                    
                )}
                </ListGroupItem>
            </ListGroup>
        </div>        
        : <div className="shift-list">
            <DropdownButton id="departments" title={shiftManagerModel.departmentID ? `Department: ${shiftManagerModel.departmentName}` : 'Select Department'} value={shiftManagerModel.departmentID || 0}>
                {shiftManagerModel.departments.map(({id, name}) => <MenuItem key={id} onSelect={() => shiftManagerModel.departmentID = id}>{name}</MenuItem>)}
            </DropdownButton>
            <ListGroup>
                {shiftManagerModel.filteredShifts.sort().map(shift => 
                    <ListGroupItem key={shift.id} onClick={() => shiftManagerModel.currentShift = shift}>
                        {shift.title}, {moment(shift.startDate).calendar()}
                    </ListGroupItem>
                )}
            </ListGroup>
        </div>}
    </div>
))

export default TimeClockComponent;