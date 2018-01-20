import {extendObservable} from 'mobx';
import axios from 'axios';

const eventId = "1";
const createJoinProcess = () => ({
        departmentId: '',
        loading: false,
        error: false,
        userData: {
            contactEmail: '',
            contactPhoneNumber: '',
            profileEmail: ''
        },
        generalQuestions: [],
        filledGeneral: false,
        departmentQuestions: [],
        filledDepartment: false,
        requestSent: false,
        language: 'he'
    });

function VolunteerRequestModel() {
    extendObservable(this, {
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

    function compareDepartments(a ,b) {
        // avaialble first
        if (a.status.availableToJoin && !b.status.availableToJoin) {
            return -1;
        }
        if (b.status.availableToJoin && !a.status.availableToJoin) {
            return 1;
        }

        // sort by name
        return a.basicInfo.nameEn.localeCompare(b.basicInfo.nameEn);
    }

    this.fetchDepartments = tryNetworkRequest(async () => {
        this.departments = (await axios.get('/api/v1/public/departments')).data;
        this.departments = this.departments.filter(department => department.status.visibleToJoin)
        this.departments = this.departments.sort(compareDepartments);
    });

    this.requestState = departmentId => {
        const department = this.departments.find(d => d._id === departmentId)
        return department.status.availableToJoin ? 'Opened' : 'Closed'
    }
  
    this.startJoinProcess = departmentId => {
        const joinProcess = createJoinProcess();
        joinProcess.departmentId = departmentId;
        this.joinProcess = joinProcess;
    }
    
    this.checkUserData = userData => {
        const departmentId = this.joinProcess.departmentId;
        const newUserData = userData;
        if (!newUserData.profileEmail) {
            newUserData.profileEmail = newUserData.contactEmail
        }
        const headers = {userdata: JSON.stringify(newUserData)};
        Promise.all([
            axios.get(`/api/v1/public/form`).then(req => req.data),
            axios.get(`/api/v1/public/form/events/${eventId}/hasAnswer`, {headers}).then(req => req.data),
            axios.get(`/api/v1/public/departments/${departmentId}/forms`).then(req => req.data),
            axios.get(`/api/v1/public/departments/${departmentId}/forms/events/${eventId}/hasAnswer`, {headers}).then(req => req.data),
            axios.get(`/api/v1/public/departments/${departmentId}/events/${eventId}/hasRequest`, {headers}).then(req => req.data)
        ]).then(([generalQuestions, generalAnswer, departmentQuestions, departmentAnswer, requestAnswer]) => {
            if (this.joinProcess.departmentId !== departmentId) { 
                return; 
            }
            this.joinProcess = {
                ...this.joinProcess,
                userData: newUserData,
                generalQuestions: generalQuestions,
                filledGeneral: generalAnswer && generalAnswer.hasAnswer,
                departmentQuestions : departmentQuestions,
                filledDepartment: departmentAnswer && departmentAnswer.hasAnswer,
                requestSent: requestAnswer && requestAnswer.hasRequest,
                loading: false
            }

            if (this.joinProcess.filledGeneral && this.joinProcess.filledDepartment && !this.joinProcess.requestSent) {
                this.sendRequest();
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
        const headers = {userdata: JSON.stringify(this.joinProcess.userData)};
        const departmentId = this.joinProcess.departmentId;
        axios.post(`/api/v1/public/form/events/${eventId}/answer`, answers, {headers}).then(res => {
            if (this.joinProcess.departmentId !== departmentId) { 
                return; 
            }
            this.joinProcess = {
                ...this.joinProcess,
                filledGeneral: true,
                loading: false,
            }
            if (this.joinProcess.filledGeneral && this.joinProcess.filledDepartment && !this.joinProcess.requestSent) {
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

    this.sendDepartmentForm = answers => {
        this.joinProcess = {
            ...this.joinProcess,
            loading: false,
        }
        const headers = {userdata: JSON.stringify(this.joinProcess.userData)};
        const departmentId = this.joinProcess.departmentId;
        axios.post(`/api/v1/public/departments/${departmentId}/forms/events/${eventId}/answer`, answers, {headers}).then(res => {
            if (this.joinProcess.departmentId !== departmentId) { 
                return; 
            }
            this.joinProcess = {
                ...this.joinProcess,
                filledDepartment: true,
                loading: false,
            };
            if (this.joinProcess.filledGeneral && this.joinProcess.filledDepartment && !this.joinProcess.requestSent) {
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
        const headers = {userdata: JSON.stringify(this.joinProcess.userData)};
        const departmentId = this.joinProcess.departmentId;
        axios.post(`/api/v1/public/departments/${departmentId}/events/${eventId}/join`,{}, {headers}).then(res => {
            if (this.joinProcess.departmentId !== departmentId) { 
                return; 
            }
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
    };

    this.init()
}

export default VolunteerRequestModel;

