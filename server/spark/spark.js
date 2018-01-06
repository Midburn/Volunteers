const axios = require('axios');
// const NodeCache = require('node-cache');

const SessionCookieName = process.env.JWT_KEY;
// const sparkCache = new NodeCache();

class SparkFacade {
    static authHeader(token) {
        return {'Authorization': `${SessionCookieName}=${token}`};
    }

    constructor(baseUrl = 'http://localhost:3000') {
        this.baseUrl = baseUrl;
    }

    getUserDetailByMails(token, emails) {
        return this.fetchSpark(
            '/users',
            token,
            {emails: emails});
    }

    getAllEvents(token) {
        return this.fetchSpark('/events', token);
    }

    // private
    fetchSpark(path, token, options) {
        return axios(
            `${this.baseUrl}${path}`,
            {
                headers: SparkFacade.authHeader(token),
                ...options
            })
            .then(response => response.data);
    }
}

module.exports = SparkFacade;