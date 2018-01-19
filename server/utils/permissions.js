const Admin = require('../models/admin');
const Volunteer = require('../models/volunteer');
const co = require('co');

module.exports = {
    getPermissions: co.wrap(function* (userDetails) {
        if (!userDetails) {
            return [];
        }
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
    }),
    isAdmin: function (userDetails) {
        if (!userDetails) {
            return false;
        }
        return userDetails && userDetails.permissions && userDetails.permissions.some(role => role.permission === 'admin');
    },
    isDepartmentManager: function (userDetails, departmentId) {
        if (!userDetails) {
            return false;
        }
        return (userDetails && userDetails.permissions &&
            userDetails.permissions.some(role => (role.permission === 'admin') ||
                (role.departmentId === departmentId && role.permission === 'manager')));
    },

    // Returns true if managing any department
    isManager: userDetails => {
        if (!userDetails || !userDetails.permissions) {
            return false;
        }
        return (userDetails.permissions.some(role => role.permission === 'admin' || role.permission === 'manager'));
    }

};