const express = require('express');
const router = express.Router();
const csv = require('csv-express');
const Shift = require('../models/shift');
const Department = require('../models/deparment');
const Volunteer = require("../models/volunteer");
const permissionsUtils = require('../utils/permissions');
const co = require('co');

// returns a csv file of shifts hours.
// each line for each volunteer in a shift.
router.get('/reports/events/:eventId/allShiftsHours', co.wrap(function*(req, res) {
    const eventId = req.params.eventId; 

    // admins only. maybe we can have another API for each departmant, but not in this scope.
    if (!permissionsUtils.isAdmin(req.userDetails)) {
        return res.status(403).json([{"error": "Action is not allowed - User doesn't have manager permissions for department " + departmentId}]);
    }

    const shifts = yield Shift.find({
        eventId
    });

    // headers
    const report = [];
    report.push(['Midburn Profile', 'Name', 'Start Time', 'End Time', 'Num Of Hours', 'Department']);

    for (let i=0; i<shifts.length; i++) {
        const shift = shifts[i];
        for (let j=0; j<shift.volunteers.length; j++) {
            const volunteerInShift = shift.volunteers[j]
            
            // user data
            // for better performance we can get all the relevant volunteers from the db once.
            const volunteer = yield Volunteer.findOne({_id: volunteerInShift.userId});
            const volunteerFirstName = volunteer && volunteer.sparkInfo ? volunteer.sparkInfo.firstName : '';
            const volunteerLastName = volunteer && volunteer.sparkInfo ? volunteer.sparkInfo.lastName : '';
            const volunteerName = `${volunteerFirstName} ${volunteerLastName}`;
            const midburnProfile = volunteer ? volunteer.userId : '';
            
            // department name
            // for better performance we can get all the departments from the db once.
            const department = yield Department.findOne({_id: shift.departmentId});
            const departmentName = department ? department.basicInfo.nameHe : 'Unknown';

            // dates
            const formatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit', hour12: false };
            const startTime = shift.startDate.toLocaleString('en-GB', formatOptions);
            const endTime = shift.endDate.toLocaleString('en-GB', formatOptions);
            const diffInHours = (shift.endDate.getTime() - shift.startDate.getTime()) / 3600000.0;

            report.push([midburnProfile, volunteerName, startTime, endTime, diffInHours, departmentName]);
        }
    }

    res.csv(report);
}))

module.exports = router;