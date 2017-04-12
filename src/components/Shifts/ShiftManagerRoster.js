import {observer} from "mobx-react"
import React from 'react'
import moment from 'moment'

const DayView = observer(({shifts, date}) => (
    <div>
        {moment(date).calendar()}
    </div>
))

const ShiftManagerRoster = observer(({shiftManagerModel}) => (
    <div className={`shift-manager-roster ${shiftManagerModel.weekView ? 'weekly' : 'daily'}`}>
        (new Array(shiftManagerModel.weekView ? 7 : 1).map((d, i) => <DayView shifts={shiftManagerModel.shifts} date={moment(shiftManagerModel.dateRange[0]).add(i, 'days')} />)
    </div>
))

export default ShiftManagerRoster;
