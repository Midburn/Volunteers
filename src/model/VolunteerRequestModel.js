import {extendObservable} from 'mobx';
import axios from 'axios';

const eventId = "1";
const createJoinProcess = () => ({
        departmentId: '',
        loading: true,
        error: false,
        sending: false,
        generalQuestions: [],
        generalAnswer: [],
        filledGeneral: false,
        departmentQuestions: [],
        departmentAnswer: [],
        filledDepartment: false,
        requestSent: false,
        language: 'he'
    });

function VolunteerRequestModel() {
    extendObservable(this, {
        requests: {},
        departments: [],
        joinProcess: createJoinProcess()
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
        if (requests && requests.length) {
            const requestsMap = requests.reduce((acc, request) => {
                acc[request.departmentId] = request;
                return acc;
            }, {});
            this.requests = requestsMap;
        } else {
            this.requests = {};
        }
    });

    this.fetchDepartments = tryNetworkRequest(async () => {
        this.departments = (await axios.get('/api/v1/departments')).data;
        this.departments = this.departments.filter(department => department.status.visibleToJoin)
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

        axios.delete(`/api/v1/departments/${departmentId}/events/${eventId}/requests`, {data: {credentials: 'include'}});
    };

    this.startJoinProcess = departmentId => {
        const joinProcess = createJoinProcess();
        joinProcess.departmentId = departmentId;
        joinProcess.loading = true;
        joinProcess.requestSent = !!this.requests[departmentId];
        this.joinProcess = joinProcess;

        Promise.all([
            axios.get(`/api/v1/form`).then(req => req.data),
            axios.get(`/api/v1/form/events/${eventId}/answer`).then(req => req.data),
            axios.get(`/api/v1/departments/${departmentId}/forms`).then(req => req.data),
            axios.get(`/api/v1/departments/${departmentId}/forms/events/${eventId}/answer`).then(req => req.data),
        ]).then(([generalQuestions, generalAnswer, departmentQuestions, departmentAnswer]) => {
            if (this.joinProcess.departmentId !== departmentId) { 
                return; 
            }
            this.joinProcess = {
                ...this.joinProcess,
                generalQuestions,
                generalAnswer,
                filledGeneral: generalAnswer && generalAnswer.form && generalAnswer.form.length > 0,
                departmentQuestions,
                departmentAnswer,
                filledDepartment: departmentAnswer && departmentAnswer.form && departmentAnswer.form.length > 0,
                loading: false
            }
        }).catch(err => {
            this.joinProcess = {
                ...this.joinProcess,
                loading: false,
                error: true
            }
        });
    };

    this.sendGeneralForm = answers => {
        this.joinProcess = {
            ...this.joinProcess,
            loading: false,
        }
        axios.post(`/api/v1/form/events/${eventId}/answer`, answers).then(res => {
            this.joinProcess = {
                ...this.joinProcess,
                generalAnswer: res.data,
                filledGeneral: true,
                loading: false,
            } 
        }).catch(err => {
            this.joinProcess = {
                ...this.joinProcess,
                loading: false,
                error: true
            }
        });
    }

    this.sendDepartmentForm = answers => {
        this.joinProcess = {
            ...this.joinProcess,
            loading: false,
        }
        const departmentId = this.joinProcess.departmentId;
        axios.post(`/api/v1/departments/${departmentId}/forms/events/${eventId}/answer`, answers).then(res => {
            this.joinProcess = {
                ...this.joinProcess,
                departmentAnswer: res.data,
                filledDepartment: true,
                loading: false,
            };
            if (!this.joinProcess.requestSent) { 
                this.sendRequest();
            }
        }).catch(err => {
            this.joinProcess = {
                ...this.joinProcess,
                loading: false,
                error: true
            }
        });
    }

    this.sendRequest = () => {
        this.joinProcess = {
            ...this.joinProcess,
            loading: false,
        }
        const departmentId = this.joinProcess.departmentId;
        axios.post(`/api/v1/departments/${departmentId}/events/${eventId}/join`).then(res => {
            this.requests[departmentId] = res.data;
            this.joinProcess = {
                ...this.joinProcess,
                loading: false,
                requestSent: true
            }
        }).catch(err => {
            this.joinProcess = {
                ...this.joinProcess,
                loading: false,
                error: true
            }
        });
    };

    this.stopJoinProcess = _ => {
        this.joinProcess.departmentId = '';
    }

    this.toggleLanguage = _ => {
        this.joinProcess.language = this.joinProcess.language === 'he' ? 'en' : 'he'; 
    }

    this.init = () => {
        this.fetchDepartments();
        this.fetchRequests();
    };

    this.init()
}

export default VolunteerRequestModel;

