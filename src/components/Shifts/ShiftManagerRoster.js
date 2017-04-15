import {observer} from "mobx-react"
import React from 'react'
import moment from 'moment'
import ShiftModal from './ShiftModal'
/* 
*/

const DayView = observer(({shifts, date}) => (
    <div class="day-view" key={date}>
        <div>
            {moment(date).format('dddd D/M')}
        </div>
    </div>
))

const ShiftManagerRoster = observer(({shiftManagerModel}) => (
    <div className={`shift-manager-roster ${shiftManagerModel.weekView ? 'weekly' : 'daily'}`}>
        {new Array(shiftManagerModel.weekView ? 7 : 1).fill(0).map((d, i) => <DayView shifts={shiftManagerModel.shifts} date={moment(shiftManagerModel.dateRange[0]).add(i, 'days')} />)}
    </div>
))

export default ShiftManagerRoster;
