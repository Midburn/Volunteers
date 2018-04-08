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
            if (!response.data) {
                return null;
            }

            response.data.forEach(profile => {
                let sparkInfo = null;

                if ("user_data" in profile) {
                    sparkInfo = profile["user_data"]
                }

                profileByMail[profile["email"]] = sparkInfo;
            });
            return profileByMail;
        }).catch(error => {
            console.log(error);
            return null;
        })
}


const getVolunteerProfile = co.wrap(function* (email, timeout) {
    try {
        const response =
            yield axios
                .post(`${SPARK_HOST}/volunteers/profiles`,
                    {emails: [email]},
                    {headers: getAuthHeader(), timeout: timeout});

        const profile = response.data[0];

        if ("user_data" in profile) {
            return profile["user_data"];
        } else {
            return null;
        }
    } catch (error) {
        return undefined;
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
    getProfile,
    getAuthHeader
};
