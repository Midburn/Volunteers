import DynamicDropdown from '../DynamicDropdown'
import {observer} from "mobx-react";
import React from 'react';
import {Radio, Button} from 'react-bootstrap'
import moment from 'moment';

const ShiftManagerHeader = observer(({shiftManagerModel}) => (
    <div className="shift-manager-header">
        <DynamicDropdown 
            key="dept"
            label="Department"
            placeholder="Select department..."
            model={shiftManagerModel}
            title="departmentName"
            collectionName="departments"
            current="departmentID" />
        
        {shiftManagerModel.departmentID ? (<div className="shift-manager-header">
            <input className="form-control" placeholder="Search" style={{width: '140px'}} name="srch-term" id="srch-term" type="text" />
            <DynamicDropdown 
                    key="status"
                    label="Shift Status"
                    model={shiftManagerModel}
                    title="shiftStatusName"
                    collectionName="shiftStatuses"
                    current="shiftStatusID" 
                    />
            <span className="date-title">
                {shiftManagerModel.dateRange[0].format('MMMM Do YYYY')} - {moment(shiftManagerModel.dateRange[1]).format('MMMM Do YYYY')}
            </span>
            <Radio key="daily" name="dateRange" className="radio-inline" value="daily" onChange={() => shiftManagerModel.weekView = false} checked={!shiftManagerModel.weekView}>Daily</Radio>
            <Radio key="weekly" name="dateRange" className="radio-inline" value="weekly" onChange={() => shiftManagerModel.weekView = true} checked={shiftManagerModel.weekView}>Weekly</Radio>
            <Button key="today" onClick={() => shiftManagerModel.date = new Date()}>Today</Button>
            {
                shiftManagerModel.specialDates.map(({date, name}) => <Button key="name" onClick={() => shiftManagerModel.date = date}>{name}</Button>)
            }
            <Button key="prev" className="glyphicon glyphicon-chevron-left" onClick={() => shiftManagerModel.date = moment(shiftManagerModel.date).subtract(1, shiftManagerModel.weekView ? 'weeks' : 'days')} />
            <Button key="next" className="glyphicon glyphicon-chevron-right" onClick={() => shiftManagerModel.date = moment(shiftManagerModel.date).add(1, shiftManagerModel.weekView ? 'weeks' : 'days')} />
        </div>) : ''
    }
    </div>
))

export default ShiftManagerHeader;
