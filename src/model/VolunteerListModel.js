import {extendObservable} from 'mobx';
import axios from 'axios';

function VolunteerListModel() {
    extendObservable(this, {
        volunteers:[],
        roles:[],
        departments:[],
        filters: {
            filterText: '',
            department: null,
            role: null,
            gotTicket: null,
            isProduction: null
        }
    });

    function logNetworkError(err) {
        if (err.response){
            console.log('Data', err.response.data);
            console.log('Status', err.response.status);
            console.log('Headers', err.response.headers);
        }
        else console.log('Error',err.message);
    }

    function tryNetworkRequest(cb) {
        return async function () {
            const a = [].slice.apply(arguments)
            try {
                cb.apply(this, a)
            } catch (e) {
                logNetworkError(e)
            }
        }
    }

    this.fetchVolunteers = tryNetworkRequest(async () => {
        this.volunteers = (await axios.get('/api/v1/volunteers/')).data
    })

    this.fetchRoles = tryNetworkRequest(async () => {
        this.roles = (await axios.get('/api/v1/roles')).data
    })

    this.fetchDepartments = tryNetworkRequest(async () => {
        this.departments = (await axios.get('/api/v1/departments')).data
    })

    this.handleRowDelete = tryNetworkRequest(async (department,profile_id) => {
        await axios.delete(`/api/v1/departments/${department}/volunteers/${profile_id}`)
        await this.fetchVolunteers()
    })

    this.handleRowChange = tryNetworkRequest(async (department, profile_id, diff) => {
        let query = Object.keys(diff).reduce((acc, cur) => `${acc}&${cur}=${diff[cur]}`, '?');
        await axios.put(`/api/v1/departments/${department}/volunteers/${profile_id}${query}`)
        await this.fetchVolunteers()
    })

    this.handleAddVolunteers = tryNetworkRequest(async (department, role, is_production, emails) => {
        console.log(`VolunteerListTab.handleAddVolunteeers: department:${department}, role:${role}, emails:${emails}`);
        // TODO - convert department to department id
        let departmentId = department;
        // TODO - create a request to test emails validity
        if (emails.length < 1) {
            console.log('no volunteers to add');
            return;
        }

        // add volunteers
        console.log(`posting to api/v1/departments/${departmentId}/volunteers`);
        await axios.post(`/api/v1/departments/${departmentId}/volunteers`, { role, is_production, emails })
        this.fetchVolunteers()
        console.log('request to server succeeded')
    })

    this.init = () => {
        this.fetchDepartments()
        this.fetchRoles()
        this.fetchVolunteers()
    }

    this.init()
}

export default VolunteerListModel

