import {observer} from "mobx-react";
import React from 'react';
import moment from 'moment';
import {Button, ButtonToolbar, DropdownButton, MenuItem, Tooltip, OverlayTrigger} from 'react-bootstrap'

const ShiftManagerHeader = observer(({shiftManagerModel}) => (
    <div className="shift-manager-header">
        <div className="shift-manager-header">
            <ButtonToolbar>
                <DropdownButton id="departments" title={shiftManagerModel.departmentID ? `Department: ${shiftManagerModel.departmentName}` : 'Select Department'} value={shiftManagerModel.departmentID || 0}>
                    {shiftManagerModel.departments.map(({id, name}) => <MenuItem key={id} onSelect={() => shiftManagerModel.departmentID = id}>{name}</MenuItem>)}
                </DropdownButton>

                <OverlayTrigger placement="top" overlay={<Tooltip id="create-session">Create session</Tooltip>}>
                    <Button bsStyle="primary" key="create" onClick={shiftManagerModel.createShift} className="glyphicon glyphicon-plus" />
                </OverlayTrigger>
                <OverlayTrigger placement="top" overlay={<Tooltip id="daily-view">Daily View</Tooltip>}>
                    <Button key="daily" onClick={() => shiftManagerModel.weekView = false}  className="glyphicon glyphicon-resize-full" />
                </OverlayTrigger>
                <OverlayTrigger placement="top" overlay={<Tooltip id="weekly-view">Weekly View</Tooltip>}>
                    <Button key="weekly" onClick={() => shiftManagerModel.weekView = true} className="glyphicon glyphicon-resize-small" />
                </OverlayTrigger>
                <OverlayTrigger placement="top" overlay={<Tooltip id="previous">Previous</Tooltip>}>
                    <Button key="prev" onClick={() => shiftManagerModel.date = moment(shiftManagerModel.date).subtract(1, shiftManagerModel.weekView ? 'weeks' : 'days')} className="glyphicon glyphicon-menu-left" />
                </OverlayTrigger>
                <OverlayTrigger placement="top" overlay={<Tooltip id="next">Next</Tooltip>}>
                    <Button key="next" onClick={() => shiftManagerModel.date = moment(shiftManagerModel.date).add(1, shiftManagerModel.weekView ? 'weeks' : 'days')} className="glyphicon glyphicon-menu-right" />
                </OverlayTrigger>
                <OverlayTrigger placement="top" overlay={<Tooltip id="today">Today</Tooltip>}>
                    <Button key="today" onClick={() => shiftManagerModel.date = moment(new Date).startOf('day')} className="glyphicon glyphicon-time" />
                </OverlayTrigger>

                {
                    shiftManagerModel.specialDates.map(({date, name}) => <Button key={name} onClick={() => shiftManagerModel.date = date} >{name}</Button>)
                }
            </ButtonToolbar>
            <input key="search" className="form-control" placeholder="Search" style={{width: 200}} name="srch-term" id="srch-term" type="text"
                onInput={e => shiftManagerModel.searchText = e.target.value}
                value={shiftManagerModel.searchText} />
        </div>
    </div>
))

export default ShiftManagerHeader;
