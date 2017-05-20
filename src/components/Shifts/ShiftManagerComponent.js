import React from 'react';
import {observer} from 'mobx-react';
import Header from "../Header/Header";

import ShiftManagerHeader from './ShiftManagerHeader'
require ('./ShiftManager.scss');
import ShiftModal from './ShiftModal'
import {DropdownButton, MenuItem} from 'react-bootstrap'

import ShiftCalendar from './ShiftCalendar';

const ShiftManagerComponent = observer(({shiftManagerModel}) =>(
    <div className="shift-manager">
        <Header />    
        <DropdownButton id="departments"
                        title={shiftManagerModel.departmentID ? `Department: ${shiftManagerModel.departmentName}` : 'Select Department'}
                        value={shiftManagerModel.departmentID || 0}>
          {shiftManagerModel.departments.map(({id, name}) => <MenuItem key={id}
                                                                       onSelect={() => shiftManagerModel.departmentID = id}>{name}</MenuItem>)}
        </DropdownButton>
        <ShiftManagerHeader key="header" shiftManagerModel={shiftManagerModel} />
        {shiftManagerModel.departmentID && <ShiftCalendar shiftManagerModel={shiftManagerModel} />}
        <ShiftModal key="modal"
            shift={shiftManagerModel.currentShift}
            departmentVolunteers={shiftManagerModel.volunteers}
            onCancel={() => shiftManagerModel.currentShift = null}
            onSubmit={() => shiftManagerModel.submitShift({close: true})} />
    </div>
))

export default ShiftManagerComponent;