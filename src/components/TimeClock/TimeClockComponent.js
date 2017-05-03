import React from 'react';
import {observer} from 'mobx-react';

import TimeClockHeader from './TimeClockHeader'
require ('./TimeClockComponent.scss');
import ShiftModal from './ShiftModal'

import ShiftCalendar from './ShiftCalendar';

const TimeClockComponent = observer(({shiftManagerModel}) =>(
    <div className="shift-manager">
        <TimeClockHeader key="header" shiftManagerModel={shiftManagerModel} />
        <ShiftCalendar shiftManagerModel={shiftManagerModel} />
        <ShiftModal key="modal"
            shift={shiftManagerModel.currentShift}
            departmentVolunteers={shiftManagerModel.volunteers}
            onCancel={() => shiftManagerModel.currentShift = null}
            onSubmit={() => shiftManagerModel.submitShift()} />
    </div>
))

export default TimeClockComponent;