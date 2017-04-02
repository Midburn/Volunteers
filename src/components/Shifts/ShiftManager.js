import ShiftManagerHeader from './ShiftManagerHeader'
import ShiftManagerRoster from './ShiftManagerRoster'
import DynamicDropdown from '../DynamicDropdown'
import {observer} from "mobx-react";
import React from 'react';
require ('./ShiftManager.scss');

const ShiftManagerComponent = observer(({shiftManagerModel}) =>(
    <div className="shift-manager">
        <ShiftManagerHeader shiftManagerModel={shiftManagerModel} />
        {
            shiftManagerModel.departmentID ? 
            <ShiftManagerRoster shiftManagerModel={shiftManagerModel} />
            : null
        }
    </div>
))

export default ShiftManagerComponent;