const  getNameById = (collection, id, dfault = "All") => (obj => obj ? obj.name : dfault)(collection.find(d => d.id === id));
import {extendObservable} from 'mobx';
import moment from 'moment';

function ShiftManagerModel() {
    extendObservable(this, {
        departmentID: null,
        departments: [],
        get departmentName() {
            return getNameById(this.departments, this.departmentID);
        },

        shiftStatusID: null,
        shiftStatuses: [{name: "Open", id: "open"}, {name: "Closed", id: "closed"}],
        get shiftStatusName() {
            return getNameById(this.shiftStatuses, this.shiftStatusID);
        },
        teamID: null,
        teams: [],
        get teamName() {
            return getNameById(this.teams, this.teamID);
        },
        volunteerTypeID: null,
        volunteerTypes: [],
        get volunteerTypeName() {
            return getNameById(this.teams, this.teamID);            
        },
        startDate: moment("20170528", "YYYYMMDD"),
        endDate: moment("20170602", "YYYYMMDD"),
        shifts: []  
    });

    this.initDepartments();
}

ShiftManagerModel.prototype.selectDepartment = async function() {
    const id = this.departmentID;
    const typesResp = await fetch(`/api/v1/volunteer/department/${id}/volunteer_types`);
    this.volunteerTypes = await typesResp.json();
    const teamsResp = await fetch(`/api/v1/volunteer/department/${id}/teams`)
    this.teams = await teamsResp.json();
};

ShiftManagerModel.prototype.reset = function() {
    this.shiftStatusID = this.teamID = this.volunteerTypeID = null;
}

ShiftManagerModel.prototype.initDepartments = async function() {
    const resp = await fetch('/api/v1/volunteer/departments')
    this.departments = await resp.json();
    console.log(JSON.stringify(this.departments));
    // Go to the database, retrieve teams, statuses and volunteer types for department
};

ShiftManagerModel.prototype.search = async function(name) {
    const optionalParam = (a) => a[1] ? [`${a[0]}=${a[1]}`] : []
    const params = [
        ['name', name],
        ['dept', this.departmentID], 
    ['type', this.volunteerTypeID],
    ['status', this.shiftStatusID],
    ['team', this.teamID]].map(optionalParam).reduce((acc, val) => acc.concat(val), []).join('&');
    const typesResp = await fetch(`/api/v1/volunteer/shifts?${params}`);
};

export default ShiftManagerModel;