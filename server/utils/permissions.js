const Admin = require('../models/admin');
const Volunteer = require('../models/volunteer');
const co = require('co');

module.exports = {
    getPermissions: co.wrap(function* (userDetails) {
        const userId = userDetails.email;
        const permissions = [];

        const admin = yield Admin.find({userId: userId});
        if (admin && admin.length) {
            permissions.push({permission: "admin"});
        }
        
        const userVolunteeringDepartments = yield Volunteer.find({userId: userId, deleted: false});
        userVolunteeringDepartments.forEach(function (volunteer) {
            permissions.push({permission: volunteer.permission, departmentId: volunteer.departmentId});
        });

        return permissions;
    })
};