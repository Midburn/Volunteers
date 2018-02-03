const sparkApi = require('../spark/sparkApi');
const Volunteer = require("../models/volunteer");
const co = require("co");

const migrateSparkInfo = co.wrap(function* () {
    console.log(`${Date.now()}: Starting spark migration`);

    const volunteers = yield Volunteer.find({deleted: false});
    const sparkInfoByUserId = {};
    let updatedVolunteers = 0;

    for (let i = 0; i < volunteers.length; i++) {
        const volunteer = volunteers[i];

        if (!(volunteer.userId in sparkInfoByUserId)) {
            try {
                const sparkInfo = yield sparkApi.getVolunteerProfile(volunteer.userId, 1000);
                sparkInfoByUserId[volunteer.userId] = sparkInfo;
            } catch (error) {
                console.error(error);
            }
        }
    }

    volunteers.forEach(volunteer => {
        const sparkInfo = sparkInfoByUserId[volunteer.userId];

        if (!sparkInfo) return;

        volunteer.sparkInfo.firstName = sparkInfo["first_name"];
        volunteer.sparkInfo.lastName = sparkInfo["last_name"];
        volunteer.sparkInfo.phone = sparkInfo.phone;
        volunteer.sparkInfo.hasTicket = sparkInfo["has_ticket"];
        volunteer.sparkInfo.lastUpdate = Date.now();

        volunteer.save();
        updatedVolunteers++;
    });

    console.log(`${Date.now()}: Spark migration finished - ${updatedVolunteers} updates`);
});

module.exports = {
    migrateSparkInfo: migrateSparkInfo
};