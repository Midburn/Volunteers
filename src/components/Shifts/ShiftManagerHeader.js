import {observer} from "mobx-react";
import React from 'react';
import moment from 'moment';
import {Button, ButtonToolbar, DropdownButton, MenuItem, Tooltip, OverlayTrigger} from 'react-bootstrap'

const ShiftManagerHeader = observer(({shiftManagerModel}) => (
    <div className="shift-manager-header">
            <ButtonToolbar style={{display: 'flex', flex: 1}}>
                <DropdownButton id="departments"
                            title={shiftManagerModel.departmentID ? `Department: ${shiftManagerModel.departmentName}` : 'Select Department'}
                            value={shiftManagerModel.departmentID || 0}>
                    {shiftManagerModel.departments.map((department) => <MenuItem key={department._id}
                    onSelect={() => shiftManagerModel.departmentID = department._id}>{department.basicInfo.nameEn}</MenuItem>)}
                </DropdownButton>
                
                <div className="btn-group btn-group-sm" style={{flex: 1, display: 'flex', justifyContent: 'flex-end'}}>
                    <Button key="create" bsStyle="primary" onClick={() => shiftManagerModel.createShift()} className="glyphicon glyphicon-plus" />
                    <Button key="daily" onClick={() => shiftManagerModel.weekView = false}  className="glyphicon glyphicon-resize-full btn-sm" />
                    <Button key="weekly" onClick={() => shiftManagerModel.weekView = true} className="glyphicon glyphicon-resize-small btn-sm" />
                    <Button key="prev" onClick={() => shiftManagerModel.date = moment(shiftManagerModel.date).subtract(1, shiftManagerModel.weekView ? 'weeks' : 'days')} className="glyphicon glyphicon-menu-left btn-sm" />
                    <Button key="next" onClick={() => shiftManagerModel.date = moment(shiftManagerModel.date).add(1, shiftManagerModel.weekView ? 'weeks' : 'days')} className="glyphicon glyphicon-menu-right btn-sm" />
                    <Button key="today" onClick={() => shiftManagerModel.date = moment(new Date).startOf('day')} className="glyphicon glyphicon-time btn-sm" />
                    {
                        shiftManagerModel.departmentID && shiftManagerModel.specialDates.map(({date, name}) => <Button  bsStyle="info" className="glyphicon btn-sm" key={name} onClick={() => shiftManagerModel.date = date} >{name}</Button>)
                    }
                </div>
            </ButtonToolbar>
    </div>
))

export default ShiftManagerHeader;
