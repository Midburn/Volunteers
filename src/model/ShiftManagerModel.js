import {extendObservable, reaction, toJS} from 'mobx';
import moment from 'moment';
import axios from 'axios'
import _ from 'lodash'

const createGuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => (
    (r => c == 'x' ? r : (r & 0x3 | 0x8))(Math.random() * 16 | 0).toString(16)
));
const getNameById = (collection, id, dfault = "All") => (obj => obj ? obj.name : dfault)(collection.find(d => d.id === id));
function ShiftManagerModel() {
    extendObservable(this, {
        departmentID: null,
        departments: [],
        get departmentName() {
            return getNameById(this.departments, this.departmentID);
        },

        date: new Date(),
        weekView: true,
        currentShift: null,
        shifts: {},
        filteredShifts: [],
        slicedShifts: [],
        focusedShift: null,
        volunteers: [],
        editError: "",
        specialDates: [
            {name: "Midburn 2017", date: moment("20170528", "YYYYMMDD")}
        ],
        get dateRange() {
            return ((t, d) => [moment(d).startOf(t), moment(d).endOf(t)])(this.weekView ? 'week' : 'day', this.date);
        },
        searchText: ''
    });


    this.initDepartments = async() => {
        const resp = await axios('/api/v1/departments', {credentials: 'include'})
        this.departments = resp.data.sort((a, b)=> a.name.localeCompare(b.name));
    }

    this.refreshShifts = async() => {
        const resp = await axios(`/api/v1/departments/${this.departmentID}/shifts`, {credentials: 'include'})
        this.shifts = resp.data
    }

    function transformShift(shift) {
        if (moment(shift.endDate).isBefore(shift.startDate)) {
            shift.endDate = moment(shift.endDate).add(1, 'days');l
        }
        return _.assign({
            startDate: moment(shift.startDate).format(),
            endDate: moment(shift.endDate).format(),
            volunteers: shift.volunteers}, _.pick(shift, ['title', 'color', 'reported', 'comment']))
    }

    this.submitShift = async({close}) => {
        if (!this.currentShift) {
            return
        }

        try {
            const method = this.currentShift.isNew ? 'post' : 'put'
            await axios(`/api/v1/departments/${this.departmentID}/shifts/${this.currentShift._id}`,
                {credentials: 'include', data: transformShift(this.currentShift), method}
            );

            await this.refreshShifts()
            const id = this.currentShift._id
            if (close) {
                this.currentShift = null
                this.focusedShift = id
            }
            return id
        } catch (e) {
            this.editError = e.message
        }
    }

    this.checkInVolunteer = (profileId, checkinTime, comment) => {
console.log(profileId, checkinTime, comment)
    };

    this.createShift = (startDate, endDate) => {
        if (!this.departmentID) {
            return null;
        }

        this.currentShift = {
            _id: createGuid(),
            startDate: startDate || moment(this.date).startOf('hour').add(1, 'hours'),
            endDate: endDate || moment(this.date).startOf('hour').add(2, 'hours'),
            title: "New Shift",
            isNew: true,
            color: "#CCCCCC",
            volunteers: []
        }
    }

    this.deleteShift = async shift => {
        await axios.delete(`/api/v1/departments/${this.departmentID}/shifts/${shift._id}`)
        this.refreshShifts()
    }

    this.editShift = shift => {
        this.currentShift = shift.shift || shift;
    }

    reaction(() => this.departments, async depts => {
        this.departmentID = this.departmentID || localStorage.getItem('currentDepartment') || depts[0];
        if (!_.find(depts, this.departmentID)) {
            this.departmentID = _.first(depts);
        }
    })

    reaction(() => this.departmentID, async dept => {
        // Can optimize by connecting with volunteer-list model
        this.volunteers = (await axios(`/api/v1/departments/${dept}/volunteers`)).data
        location.href = `#${dept}`
        this.refreshShifts()
    })

    const deptFromHash = () => {
        const dept = +location.hash.substr(1)
        if (_.isFinite(dept)) {
            this.departmentID = dept
        }
    }

    window.onhachchange = window.onload = deptFromHash

    reaction(() => this.currentShift, async shift => {
        this.refreshShifts()
    })

    const extractTextsFromShift = shift => _([shift.title, ..._.map(shift.volunteers, _.values)])
        .flatten()
        .filter(_.isString)
        .map(s => s.toLowerCase())
        .value()

    reaction(() => [this.shifts, this.searchText, this.dateRange, this.volunteers], ([shifts, searchText, [startDate, endDate], volunteers]) => {
        this.filteredShifts = _.map(shifts,
            (shift, id) =>
                _.defaults({id, volunteers: shift.volunteers}, shift)
        );
    })

    reaction(() => [this.filteredShifts], ([shifts]) =>  {
        this.slicedShifts = _.reduce(shifts, (sliced, shift) => {
            const breakpoint = moment(shift.endDate).startOf('day');
            if (breakpoint.isSame(moment(shift.startDate).startOf('day'))) {
                return [...sliced, shift];
            }

            return [...sliced, _.defaults({endDate: moment(breakpoint).add(-1, 'minute'), shift}, shift), _.defaults({startDate: breakpoint, shift}, shift)];
        }, []);
    })

    this.initDepartments()
}

export default ShiftManagerModel;
