import React from 'react';
import {observer} from 'mobx-react';
import Header from "../Header/Header";

import ShiftManagerHeader from './ShiftManagerHeader'
require ('./ShiftManager.scss');
import ShiftModal from './ShiftModal'

import ShiftCalendar from './ShiftCalendar';

const ShiftManagerComponent = observer(({shiftManagerModel}) =>(
    <div className="shift-manager">
        <Header />    
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