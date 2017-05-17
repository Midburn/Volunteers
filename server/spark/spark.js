const path = require('path');
const fs = require('fs');
const http = require('http');
const axios = require('axios');
const _ = require('lodash');

const SessionCookieName = process.env.JWT_KEY;


class SparkFacade {

    constructor(baseUrl = 'http://localhost:3000') {
        this.baseUrl = baseUrl;
    }

    volunteers(token) {
        return this.fetchSpark('/volunteers/volunteers', {headers: this.authHeader(token)}).then(data => (
            data.map(item => _.assign({profile_id: item.user_id, phone: item.phone_number},
                _.pick(item, ['department_id', 'email', 'first_name', 'last_name', 'got_ticket', 'is_production', 'role_id']))
            )
        ));
    }

    departments(token) {
        return this.fetchSpark('/volunteers/departments', {headers: this.authHeader(token)})
            .then(depts => depts.map(n => _.assign({name: n.name_en}, n)));
    }

    allRoles(token) {
        return this.fetchSpark('/volunteers/roles', {headers: this.authHeader(token)});
    }

    rolesByUser(token, userId) {
        return this.fetchSpark(`/volunteers/${userId}/roles`, this.authHeader(token));
    }

    volunteersByDepartment(token, departmentId) {
        return this.fetchSpark(`/volunteers/departments/${departmentId}/volunteers/`,
            {headers: this.authHeader(token)}).then(data => (
            data.map(item => _.assign({profile_id: item.user_id, phone: item.phone_number},
                _.pick(item, ['department_id', 'email', 'first_name', 'last_name', 'got_ticket', 'is_production', 'role_id']))
            )
        ));
    }

    addVolunteers(token, departmentId, volunteers) {
        return this.fetchSpark(`/volunteers/departments/${departmentId}/volunteers`,
            {headers: this.authHeader(token), method: 'post', data: volunteers});
    }

    updateVolunteer(token, departmentId, volunteerId, volunteer) {
        return this.fetchSpark(`/volunteers/departments/${departmentId}/volunteers/${volunteerId}`,
            {
                headers: this.authHeader(token),
                method: 'put',
                data: volunteer
            }).then(data => _.pick(data, ['status']))
    }

    deleteVolunteer(token, departmentId, volunteerId) {
        return this.fetchSpark(`/volunteers/departments/${departmentId}/volunteers/${volunteerId}/`, {
            headers: this.authHeader(token), method: 'delete'
        }).then(data => _.pick(data, ['status']))
    }

    // private
    fetchSpark(path, options) {
        return axios(`${this.baseUrl}${path}`, options).then(r => r.data);
    }

    authHeader(token) {
      return {'Cookie': `${SessionCookieName}=${token}`};
    }
}

module.exports = SparkFacade;