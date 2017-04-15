import ShiftManagerHeader from './ShiftManagerHeader'
import ShiftManagerRoster from './ShiftManagerRoster'
import DynamicDropdown from '../DynamicDropdown'
import {observer} from "mobx-react";
import React from 'react';
require ('./ShiftManager.scss');
import ShiftModal from './ShiftModal'

const ShiftManagerComponent = observer(({shiftManagerModel}) =>(
    <div className="shift-manager">
        <ShiftManagerHeader key="header" shiftManagerModel={shiftManagerModel} />
        <ShiftManagerRoster key="roster" shiftManagerModel={shiftManagerModel} />
        <ShiftModal key="modal"
            shift={shiftManagerModel.currentShift}
            departmentVolunteers={shiftManagerModel.volunteers}
            onCancel={() => shiftManagerModel.currentShift = null}
            onSubmit={() => shiftManagerModel.submitShift().then(id => document.getElementById(id).scrollIntoView())} />
    </div>
))

export default ShiftManagerComponent;