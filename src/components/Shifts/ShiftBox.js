import {observer} from "mobx-react"
import React from 'react'
import moment from 'moment'
require ('./ShiftBox.scss');

const ShiftBox = observer(({shift, index, totalOverlapping, onEdit, onDelete}) => {
    const {id, title, color, startDate, endDate, volunteers} = shift
    const startOfDay = moment(startDate).startOf('day')
    const relStart = moment(startDate).diff(startOfDay, 'days', true)
    const relEnd = moment(endDate).diff(startOfDay, 'days', true)
    return <div key={id} className="shift-box" tabIndex={index}
            style={{ 
                left: `${index * 100 / totalOverlapping}%`,
                top: `${relStart}%`,
                width: `${100 / totalOverlapping}%`,
                height: `${(relEnd - relStart) * 100}%`,
                backgroundColor: color
                }}>

            <div className="title">{title}</div>
            <div className="count">{volunteers.length} volunteers</div>
            <div className="toolbar">
                <input type="button" onClick={onEdit} value="Edit" />
                <input type="button" onClick={onDelete} value="Delete" />
            </div>
        </div> 
})

export default ShiftBox