const shifts = {}

function shiftsByDepartment(department) {
    return Promise.resolve(shifts[department] || {})
}

function addShift(department, id, shiftData) {
    shiftsByDepartment(department)[id] = shiftData
    return Promise.resolve()
}

function updateShift(department, id, shiftData) {
    shiftsByDepartment(department)[id] = shiftData
    return Promise.resolve()
}

function deleteShift(department, id) {
    delete shiftsByDepartment(department)[id]
    return Promise.resolve()
}

module.exports = {shiftsByDepartment, addShift, updateShift, deleteShift}