const session = require('express-session');
const path = require('path');
const fs = require('fs');
const http = require('http');
const axios = require('axios')
const _ = require('lodash')


class SparkFacade {

  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }
  
  volenteers() {
    return this.fetchSpark('/volunteers/volunteers').then(data => (
      data.map(item => _.assign({profile_id: item.user_id, phone: item.phone_number},
        _.pick(item, ['department_id', 'email', 'first_name', 'last_name', 'got_ticket', 'is_production', 'role_id']))
      )
    ));
  }

  departments() {
    return this.fetchSpark('/volunteers/departments/')
               .then(depts => depts.map(n => _.assign({name: n.name_en}, n)));
  }

  roles() {
    return this.fetchSpark('/volunteers/roles/');
  }

  volunteersByDepartment(departmentId) {
    return this.fetchSpark(`/volunteers/departments/${departmentId}/volunteers/`).then(data => (
      data.map(item => _.assign({profile_id: item.user_id, phone: item.phone_number},
        _.pick(item, ['department_id', 'email', 'first_name', 'last_name', 'got_ticket', 'is_production', 'role_id']))
      )
    ));
  }

  addVolunteers(departmentId, volunteers) {
    return this.fetchSpark(`/volunteers/departments/${departmentId}/volunteers`,
                           {method: 'post', data: volunteers});
  }

  updateVolunteer(departmentId, volunteerId, volunteer) {
    return this.fetchSpark(`/volunteers/departments/${departmentId}/volunteers/${volunteerId}`,
      {
        method: 'put',
        data: volunteer
      }).then(data => _.pick(data, ['status']))
  }

  deleteVolunteer(departmentId, volunteerId) {
    return this.fetchSpark(`/volunteers/departments/${departmentId}/volunteers/${volunteerId}/`, {
      method: 'delete'
    }).then(data => _.pick(data, ['status']))  }

  // private
  fetchSpark(path, options) {
    return axios(`${this.baseUrl}${path}`, options).then(r => r.data);
  }
}

module.exports = SparkFacade;