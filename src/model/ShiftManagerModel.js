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
        this.departments = resp.data
    }

    this.refreshShifts = async() => {
        const resp = await axios(`/api/v1/departments/${this.departmentID}/shifts`, {credentials: 'include'})
        this.shifts = resp.data
    }

    function transformShift(shift) {
        return _.assign({
            startDate: moment(shift.startDate).format(),
            endDate: moment(shift.endDate).format(),
            volunteers: _.compact(shift.volunteers.map(v => _.isObject(v) ? +v.profile_id : +v))
        }, _.pick(shift, ['title', 'color', 'reported']))
    }

    this.submitShift = async({close}) => {
        if (!this.currentShift) {
            return
        }

        try {
            const method = this.currentShift.isNew ? 'post' : 'put'
            await axios(`/api/v1/departments/${this.departmentID}/shifts/${this.currentShift._id}`,
                {credentials: 'include', data: transformShift(this.currentShift), method}
            )

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
        this.currentShift = shift;
    }

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
        console.log(toJS(shifts))
        this.filteredShifts = _.map(shifts,
            (shift, id) =>
                _.defaults({id, volunteers: _.compact(shift.volunteers).map(v => _.find(volunteers, {profile_id: +v}))}, shift)
        );


    })

    this.initDepartments()
}

export default ShiftManagerModel;
