import {extendObservable} from 'mobx';
import axios from 'axios';

function VolunteerRequestModel() {
    extendObservable(this, {
        requests: [],
        departments: []
    });

    function logNetworkError(err) {
        if (err.response) {
            console.log('Data', err.response.data);
            console.log('Status', err.response.status);
            console.log('Headers', err.response.headers);
        }
        else console.log('Error', err.message);
    }

    function tryNetworkRequest(cb) {
        return async function () {
            const a = [].slice.apply(arguments);
            try {
                cb.apply(this, a)
            } catch (e) {
                logNetworkError(e)
            }
        }
    }

    this.fetchRequests = tryNetworkRequest(async () => {
        const requests = (await axios.get('/api/v1/volunteer-requests')).data;

        const requestStatus = {};

        for (let index = 0; index < requests.length; index++) {
            requestStatus[requests.data[index]["departmentId"]] = requests.data[index]["approved"]
        }

        this.requests = requestStatus;
    });

    this.fetchDepartments = tryNetworkRequest(async () => {
        this.departments = (await axios.get('/api/v1/departments')).data;
        this.departments = this.departments.filter(department => department.status && department.status.visibleToJoin)
    });

    this.requestState = departmentId => {
      if (departmentId in this.requests) {
        return this.requests[departmentId]
      }

      const department = this.departments.find(d => d._id === departmentId)
      return department.status.availableToJoin ? 'Opened' : 'Closed'
    }

    this.handleCancelRequest = departmentId => {
        const requests = {...this.requests};
        delete requests[departmentId];
        this.requests = requests;
        const eventId = "1";

        axios.delete(`/api/v1/departments/${departmentId}/events/${eventId}/requests`, {data: {credentials: 'include'}});
    };

    this.handleSendRequest = departmentId => {
        this.requests = {...this.requests, [departmentId]: false};

        const eventId = "1";
        axios.post(`/api/v1/departments/${departmentId}/events/${eventId}/requests`, {credentials: 'include'});
    };

    this.init = () => {
        this.fetchDepartments();
        this.fetchRequests();
    };

    this.init()
}

export default VolunteerRequestModel;

