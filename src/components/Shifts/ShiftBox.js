import {observer} from "mobx-react"
import React from 'react'
import moment from 'moment'
require ('./ShiftBox.scss');

const ShiftBox = observer(({shift, onEdit, onDelete, focusedShift, onFocus}) => {
    const {id, title, color, startDate, endDate, volunteers} = shift
    const startOfDay = moment(startDate).startOf('day')
    const relStart = moment(startDate).diff(startOfDay, 'days', true)
    const relEnd = moment(endDate).diff(startOfDay, 'days', true)
    return <div key={id} className={`shift-box ${shift.id === focusedShift ? 'focused' :''}`}
            style={{ 
                left: `${shift.overlapIndex * 100 / shift.overlapCount}%`,
                top: `${relStart * 100}%`,
                width: `${100 / shift.overlapCount}%`,
                height: 0
                }}>
                <div className="box" style={{backgroundColor: color}}  onClick={() => onFocus(id)}>
                    <div className="title">{title}</div>
                    <div className="count">{volunteers.length} volunteers</div>
                    <div className="duration">{moment(endDate).diff(startDate, 'minutes')} minutes</div>
                    <div className="toolbar">
                        <input type="button" onClick={() => onEdit(shift)} value="Edit" />
                        <input type="button" onClick={() => onDelete(shift)} value="Delete" />
                    </div>
                </div>

        </div> 
})

export default ShiftBox