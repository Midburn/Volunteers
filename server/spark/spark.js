const path = require('path');
const fs = require('fs');
const http = require('http');
const axios = require('axios');
const NodeCache = require('node-cache');
const _ = require('lodash');

const SessionCookieName = process.env.JWT_KEY;
const sparkCache = new NodeCache();

class SparkFacade {

  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
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

  volunteers(token) {
    let volunteers;

    volunteers = sparkCache.get('volunteers');

    if (volunteers) {
      return new Promise((resolve, reject) => {
        resolve(volunteers);
      });
    }

    return this.fetchSpark('/volunteers/volunteers', {headers: this.authHeader(token)}).then(data => {
        volunteers = data.map(item => _.assign({profile_id: item.user_id, phone: item.phone_number},
          _.pick(item, ['department_id', 'email', 'first_name', 'last_name', 'got_ticket', 'is_production', 'role_id'])));

        sparkCache.set('volunteers', volunteers);

        return volunteers;
      }
    );
  }

  volunteersByDepartment(token, departmentId) {

    let volunteers;

    volunteers = sparkCache.get(`volunteers-${departmentId}`);

    if (volunteers) {
      return new Promise((resolve, reject) => {
        resolve(volunteers);
      });
    }

    return this.fetchSpark(`/volunteers/departments/${departmentId}/volunteers/`,
      {headers: this.authHeader(token)}).then(data => {
      volunteers = data.map(item => _.assign({profile_id: item.user_id, phone: item.phone_number},
        _.pick(item, ['department_id', 'email', 'first_name', 'last_name', 'got_ticket', 'is_production', 'role_id']))
      );

      sparkCache.set(`volunteers-${departmentId}`, volunteers);

      return volunteers;
    });
  }

  addVolunteers(token, departmentId, volunteers) {
    sparkCache.del('volunteers');
    sparkCache.del(`volunteers-${departmentId}`);

    return this.fetchSpark(`/volunteers/departments/${departmentId}/volunteers`,
      {headers: this.authHeader(token), method: 'post', data: volunteers});
  }

  updateVolunteer(token, departmentId, volunteerId, volunteer) {
    sparkCache.del('volunteers');
    sparkCache.del(`volunteers-${departmentId}`);

    return this.fetchSpark(`/volunteers/departments/${departmentId}/volunteers/${volunteerId}`,
      {
        headers: this.authHeader(token),
        method: 'put',
        data: volunteer
      }).then(data => _.pick(data, ['status']))
  }

  deleteVolunteer(token, departmentId, volunteerId) {
    sparkCache.del('volunteers');
    sparkCache.del(`volunteers-${departmentId}`);

    return this.fetchSpark(`/volunteers/departments/${departmentId}/volunteers/${volunteerId}/`, {
      headers: this.authHeader(token), method: 'delete'
    }).then(data => _.pick(data, ['status']))
  }

  deleteVolunteersCache() {
    sparkCache.flushAll();

    return new Promise((resolve, reject) => resolve({result: true}));
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