const axios = require('axios');
const cache = require('js-cache');
const co = require("co");

const SPARK_HOST = (process.env.LOCAL_SPARK !== 'true') ? process.env.SPARK_HOST : 'http://localhost:3000';
const SECRET = (process.env.LOCAL_SPARK !== 'true') ? process.env.SECRET : "secret";

function getAuthHeader() {
    return {token: SECRET};
}

// GET PROFILES
function getProfileByMail(emails, timeout) {
    const profileByMail = {};
    return axios.post(`${SPARK_HOST}/volunteers/profiles`, {emails}, {headers: getAuthHeader(), timeout: timeout})
        .then(response => {
            try {
                console.log(`Spark res: ${JSON.stringify(response.data)}`);
            } catch (error) {
                console.log(`Spark res: ${response.data}`);
            }

            if (!response.data) {
                return {};
            }
            response.data.forEach(profile => {
                if (!('user_data' in profile)) return;
                profileByMail[profile['email']] = profile['user_data'];
            });
            return profileByMail;
        }).catch(error => {
            console.log(error);
            return {};
        })
}

const getVolunteerProfile = co.wrap(function* (email, timeout) {
    try {
        const response = yield axios.post(
            `${SPARK_HOST}/volunteers/profiles`,
            {emails: [email]},
            {headers: getAuthHeader(), timeout: timeout});


        if (!response.data) return null;

        return response.data[0]['user_data'];
    } catch (error) {
        console.log(error);
        return null;
    }
});

// Retunrs profile info , using the cached data if available
const getProfile = co.wrap(function* (email) {
    let info = cache.get(email)
    if (info) {
        return info;
    }

    const profiles = yield getProfileByMail([email], 15 * 1000);
    info = profiles[email];
    if (info) {
        cache.set(email, info, 2 * 60 * 60 * 1000) // 2 hours
        return info;
    }
    return null;
})

module.exports = {
    getProfileByMail: getProfileByMail,
    getVolunteerProfile: getVolunteerProfile,
    getProfile
};
