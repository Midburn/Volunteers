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
        date: new Date(),
        weekView: true,
        shifts: [],
        specialDates: [
            {name: "Midburn 2017", date: moment("20170528", "YYYYMMDD")}
        ],
        get dateRange() {
            return ((t, d) => [moment(d).startOf(t), moment(d).endOf(t)])(this.weekView ? 'week' : 'day', this.date);
        },
        searchText: ''
    });

    this.initDepartments();
}

ShiftManagerModel.prototype.initDepartments = async function() {
    const resp = await fetch('/api/v1/volunteer/departments', {credentials: 'include'})
    this.departments = await resp.json();
};

ShiftManagerModel.prototype.search = async function() {
    const optionalParam = (a) => a[1] ? [`${a[0]}=${a[1]}`] : []
    const params = [
        ['text', this.searchText],
        ['dept', this.departmentID],
    ['status', this.shiftStatusID]].map(optionalParam).reduce((acc, val) => acc.concat(val), []).join('&');
    const typesResp = await fetch(`/api/v1/volunteer/shifts?${params}`, {credentials: 'include'});
};

export default ShiftManagerModel;
