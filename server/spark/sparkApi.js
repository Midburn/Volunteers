const axios = require('axios');

const SPARK_HOST = (process.env.LOCAL_SPARK !== 'true') ? process.env.SPARK_HOST : 'http://localhost:3000';
const SECRET = process.env.SECRET;

function getAuthHeader() {
    return {token: SECRET};
}

// GET PROFILES
function getProfileByMail(emails) {
    const profileByMail = {};
    return axios.post(`${SPARK_HOST}/volunteers/profiles`, {emails}, {headers: getAuthHeader()})
        .then(response => {
            response.data.forEach(profile => {
                if (!('user_data' in profile)) return;

                profileByMail[profile['email']] = profile['user_data'];
            });

            return profileByMail;
        });
}

module.exports = {
    getProfileByMail: getProfileByMail
};
