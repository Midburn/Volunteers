import React from 'react';
import {observer} from 'mobx-react';

import ShiftManagerHeader from './ShiftManagerHeader'
require ('./ShiftManager.scss');
import ShiftModal from './ShiftModal'

import ShiftCalendar from './ShiftCalendar';

const ShiftManagerComponent = observer(({shiftManagerModel}) =>(
    <div className="shift-manager">
        <ShiftManagerHeader key="header" shiftManagerModel={shiftManagerModel} />
        <ShiftCalendar shiftManagerModel={shiftManagerModel} />
        <ShiftModal key="modal"
            shift={shiftManagerModel.currentShift}
            departmentVolunteers={shiftManagerModel.volunteers}
            onCancel={() => shiftManagerModel.currentShift = null}
            onSubmit={() => shiftManagerModel.submitShift()} />
    </div>
))

export default ShiftManagerComponent;