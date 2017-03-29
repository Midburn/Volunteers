import React from 'react';
import {observer} from "mobx-react";

const Dropdown = observer(({label, shiftManagerModel, collection, current, placeholder = "All"}) => {
    const model = shiftManagerModel[collection] || [];
    return <div className="filter-component form-group">
        <label htmlFor={`select_${collection}`}>{label}:</label>
        <select 
            id={`select_${collection}`}
            value={shiftManagerModel[current] || ''}
            onChange={e => shiftManagerModel[current] = e.target.value}>

            <option key="">{model.length ? placeholder : ''}</option>

            {model.map(
                entry => <option key={entry.id} value={entry.id}>{entry.name}</option>
            )}
        </select>            
    </div>
})

const ShiftManagerComponent = observer(({shiftManagerModel}) =>(
    <div className="shift-manager">
        <Dropdown 
            key="dept"
            label="Department"
            placeholder="Select department..."
            shiftManagerModel={shiftManagerModel}
            collection="departments"
            current="departmentID" />
        
        <a href="#" onClick={e => shiftManagerModel.selectDepartment()}>Go</a>
        <label htmlFor="volunteer_input">Search for volunteer's shift</label>
        <input type="text" id="volunteer_input"  onChange={e => this.freeText = e.target.value} />

        {shiftManagerModel.teams.length && (<div>
            <Dropdown 
                key="status"
                label="Shift Status"
                shiftManagerModel={shiftManagerModel}
                collection="shiftStatuses"
                current="shiftStatusID" 
                />

            <Dropdown 
                key="team"
                label="Team"
                shiftManagerModel={shiftManagerModel}
                collection="teams"
                current="teamID"
                />

            <Dropdown 
                key="volunteerType"
                label="Volunteer Type"
                shiftManagerModel={shiftManagerModel}
                collection="volunteerTypes"
                current="volunteerTypeID"
                />

            <a href="#" onClick={() => shiftManagerModel.search(this.freeText)}>Search</a>
            <a href="#" onClick={() => shiftManagerModel.reset()}>Reset</a>
        </div>)
    }
    </div>
))

export default ShiftManagerComponent;