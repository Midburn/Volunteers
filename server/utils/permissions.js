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

        // TODO: read manager & volunteer permissions
        const userVolunteeringDepartments = yield Volunteer.find({userId: userId, deleted: false});
        userVolunteeringDepartments.forEach(function (volunteer) {
            permissions.push({permission: volunteer.roleId, departmentId: volunteer.departmentId});
        });

        return permissions;
    })
};