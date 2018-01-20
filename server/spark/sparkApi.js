const axios = require('axios');

const SPARK_HOST = (process.env.LOCAL_SPARK !== 'true') ? process.env.SPARK_HOST : 'http://localhost:3000';
const SECRET = process.env.SECRET;

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

module.exports = {
    getProfileByMail: getProfileByMail
};
