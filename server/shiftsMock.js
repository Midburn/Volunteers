const shifts = {}

function shiftsByDepartment(department) {
    return Promise.resolve(shifts[department] || {})
}

function addShift(department, id, shiftData) {
    shifts[department] = shifts[department] || {}
    shifts[department][id] = shiftData
    return Promise.resolve()
}

function deleteShift(department, id) {
    shifts[department] = shifts[department] || {}
    delete shifts[department][id]
    return Promise.resolve()
}

module.exports = {shiftsByDepartment, addShift, updateShift: addShift, deleteShift}