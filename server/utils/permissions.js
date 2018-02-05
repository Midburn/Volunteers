const Admin = require('../models/admin');
const Volunteer = require('../models/volunteer');
const co = require('co');

function getUserIdRegex(userId) {
    return new RegExp(["^", userId, "$"].join(""), "i");
}

module.exports = {
    getPermissions: co.wrap(function* (userDetails) {
        if (!userDetails) {
            return [];
        }
        const userId = userDetails.email;
        // following https://stackoverflow.com/questions/1863399/mongodb-is-it-possible-to-make-a-case-insensitive-query
        const userIdRegex = getUserIdRegex(userId);
        const permissions = [];

        const admin = yield Admin.find({userId: userIdRegex});
        if (admin && admin.length) {
            permissions.push({permission: "admin"});
        }

        const userVolunteeringDepartments = yield Volunteer.find({userId: userIdRegex, deleted: false});
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