const sparkApi = require('../spark/sparkApi');
const Volunteer = require("../models/volunteer");
const VolunteerRequest = require("../models/volunteerRequest");
const co = require("co");

const getProfilesFromSpark = co.wrap(function* (userIds) {
    let sparkInfoByUserId = yield sparkApi.getProfileByMail(userIds, 20 * 1000);

    if (sparkInfoByUserId) {
        return sparkInfoByUserId;
    }

    sparkInfoByUserId = {};

    for (let i = 0; i < userIds.length; i++) {
        const userId = userIds[i];

        try {
            const sparkInfo = yield sparkApi.getVolunteerProfile(userId, 2 * 1000);
            sparkInfoByUserId[userId] = sparkInfo;
        } catch (error) {
            sparkInfoByUserId[userId] = undefined;
            console.error(error);
        }
    }

    return sparkInfoByUserId;
});

const updateVolunteersSparkInfo = co.wrap(function* (volunteers) {
    const volunteerEmails = volunteers.map(volunteer => volunteer.userId);
    const sparkInfoByUserId = yield getProfilesFromSpark(volunteerEmails);
    let updatedVolunteers = 0;

    volunteers.forEach(volunteer => {
        const sparkInfo = sparkInfoByUserId[volunteer.userId];

        if (sparkInfo === undefined) return;

        if (sparkInfo === null) {
            volunteer.sparkInfo.validProfile = false;
        } else {
            volunteer.sparkInfo.firstName = sparkInfo["first_name"];
            volunteer.sparkInfo.lastName = sparkInfo["last_name"];
            volunteer.sparkInfo.phone = sparkInfo.phone;
            volunteer.sparkInfo.hasTicket = sparkInfo["has_ticket"];
            volunteer.sparkInfo.lastUpdate = Date.now();
            volunteer.sparkInfo.validProfile = true;

            updatedVolunteers++;
        }

        volunteer.save();
    });

    return updatedVolunteers;
});

const migrateVolunteerSparkInfo = co.wrap(function* () {
    console.log(`${Date.now()}: Starting spark volunteers migration`);

    try {
        const volunteers =
            yield Volunteer
                .find({deleted: false, sparkInfo: {$exists: false}})
                .limit(50);
        const updatedVolunteers = yield updateVolunteersSparkInfo(volunteers);

        console.log(`${Date.now()}: Spark volunteers migration finished - ${updatedVolunteers}/${volunteers.length} updated successfully`);
    } catch (error) {
        console.error('Volunteers migration failed', error);
    }
});

const updateValidVolunteerSparkInfo = co.wrap(function* () {
    console.log(`${Date.now()}: Starting spark volunteers update`);

    try {
        const volunteers =
            yield Volunteer
                .find({deleted: false, "sparkInfo.validProfile": true})
                .sort({"sparkInfo.lastUpdate": 1})
                .limit(50);
        const updatedVolunteers = yield updateVolunteersSparkInfo(volunteers);

        console.log(`${Date.now()}: Spark volunteers update was finished - ${updatedVolunteers}/${volunteers.length} updated successfully`);
    } catch (error) {
        console.error('Update volunteers failed', error);
    }
});

const updateInvalidVolunteerSparkInfo = co.wrap(function* () {
    console.log(`${Date.now()}: Starting spark invalid volunteer profiles migration`);

    try {
        const volunteers =
            yield Volunteer
                .find({deleted: false, "sparkInfo.validProfile": false})
                .limit(20);
        const updatedVolunteers = yield updateVolunteersSparkInfo(volunteers);

        console.log(`${Date.now()}: Invalid spark volunteer profiles update was finished - ${updatedVolunteers}/${volunteers.length} updated successfully`);
    } catch (error) {
        console.error('Update invalid volunteers failed', error);
    }
});

const migrateVolunteerRequestSparkInfo = co.wrap(function* () {
    console.log(`${Date.now()}: Starting spark volunteers requests migration`);

    try {
        const volunteers =
            yield VolunteerRequest
                .find({sparkInfo: {$exists: false}})
                .limit(50);
        const updatedVolunteers = yield updateVolunteersSparkInfo(volunteers);

        console.log(`${Date.now()}: Spark volunteers requests migration finished - ${updatedVolunteers}/${volunteers.length} updated successfully`);
    } catch (error) {
        console.error('Volunteers requests migration failed', error);
    }
});

const updateValidVolunteerRequestSparkInfo = co.wrap(function* () {
    console.log(`${Date.now()}: Starting spark volunteers requests update`);

    try {
        const volunteers =
            yield VolunteerRequest
                .find({"sparkInfo.validProfile": true})
                .sort({"sparkInfo.lastUpdate": 1})
                .limit(50);
        const updatedVolunteers = yield updateVolunteersSparkInfo(volunteers);

        console.log(`${Date.now()}: Spark volunteers requests update was finished - ${updatedVolunteers}/${volunteers.length} updated successfully`);
    } catch (error) {
        console.error('Update volunteers requests failed', error);
    }
});

const updateInvalidVolunteerRequestSparkInfo = co.wrap(function* () {
    console.log(`${Date.now()}: Starting spark invalid volunteers requests profiles migration`);

    try {
        const volunteers =
            yield VolunteerRequest
                .find({"sparkInfo.validProfile": false})
                .limit(20);
        const updatedVolunteers = yield updateVolunteersSparkInfo(volunteers);

        console.log(`${Date.now()}: Invalid spark volunteers requests profiles update was finished - ${updatedVolunteers}/${volunteers.length} updated successfully`);
    } catch (error) {
        console.error('Update invalid volunteers requests failed', error);
    }
});

module.exports = {
    migrateVolunteerSparkInfo: migrateVolunteerSparkInfo,
    updateValidVolunteerSparkInfo: updateValidVolunteerSparkInfo,
    updateInvalidVolunteerSparkInfo: updateInvalidVolunteerSparkInfo,
    migrateVolunteerRequestSparkInfo: migrateVolunteerRequestSparkInfo,
    updateValidVolunteerRequestSparkInfo: updateValidVolunteerRequestSparkInfo,
    updateInvalidVolunteerRequestSparkInfo: updateInvalidVolunteerRequestSparkInfo
};