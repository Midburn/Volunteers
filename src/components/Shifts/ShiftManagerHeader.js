import DynamicDropdown from '../DynamicDropdown'
import {observer} from "mobx-react";
import React from 'react';
import moment from 'moment';

const ShiftManagerHeader = observer(({shiftManagerModel}) => (
    <div className="shift-manager-header">
        <select onChange={e => shiftManagerModel.departmentID = e.target.value} value={shiftManagerModel.departmentID || 0}>
            <option value="0">Select Department</option>
            {shiftManagerModel.departments.map(({id, name}) => <option value={id} key={id}>{name}</option>)}
        </select>
        
        <div className="shift-manager-header">
            <input type="button" key="create" value="New" onClick={shiftManagerModel.createShift} />
            <input key="search" className="form-control" placeholder="Search" style={{width: '140px'}} name="srch-term" id="srch-term" type="text" 
                onInput={e => shiftManagerModel.searchText = e.target.value}
                value={shiftManagerModel.searchText} />

            <input type="button" key="daily" value="Daily" onClick={() => shiftManagerModel.weekView = false} value="Daily" />
            <input type="button" key="weekly" value="Weekly" onClick={() => shiftManagerModel.weekView = true} value="Weekly" />
            <input type="button" key="today" onClick={() => shiftManagerModel.date = new Date()} value="Now" />
            {
                shiftManagerModel.specialDates.map(({date, name}) => <input key={name} onClick={() => shiftManagerModel.date = date} type="button" value={name} />)
            }
            <input type="button" key="prev" onClick={() => shiftManagerModel.date = moment(shiftManagerModel.date).subtract(1, shiftManagerModel.weekView ? 'weeks' : 'days')} value="&lt;" />
            <input type="button" onClick={() => shiftManagerModel.date = moment(shiftManagerModel.date).add(1, shiftManagerModel.weekView ? 'weeks' : 'days')} value="&gt;" />
        </div>
    </div>
))

export default ShiftManagerHeader;
