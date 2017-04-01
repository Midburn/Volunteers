import DynamicDropdown from '../DynamicDropdown'
import {observer} from "mobx-react";
import React from 'react';
require ('./ShiftManager.scss');

const ShiftManagerComponent = observer(({shiftManagerModel}) =>(
    <div className="shift-manager">
        <div className="shift-manager-header">
        <DynamicDropdown 
            key="dept"
            label="Department"
            placeholder="Select department..."
            onSelect={() => shiftManagerModel.selectDepartment()}
            model={shiftManagerModel}
            title="departmentName"
            collectionName="departments"
            current="departmentID" />
        
        {shiftManagerModel.teams.length ? (<div className="shift-manager-header">
        <input className="form-control" placeholder="Search" name="srch-term" id="srch-term" type="text" />
        <DynamicDropdown 
                key="status"
                label="Shift Status"
                model={shiftManagerModel}
                title="shiftStatusName"
                collectionName="shiftStatuses"
                current="shiftStatusID" 
                />

            <DynamicDropdown 
                key="team"
                label="Team"
                model={shiftManagerModel}
                title="teamName"
                collectionName="teams"
                current="teamID"
                />

            <DynamicDropdown 
                key="volunteerType"
                label="Volunteer Type"
                title="volunteerTypeName"
                model={shiftManagerModel}
                collectionName="volunteerTypes"
                current="volunteerTypeID"
                />
        </div>) : ''
    }
    </div>
    </div>
))

export default ShiftManagerComponent;