const  getNameById = (collection, id, dfault = "All") => (obj => obj ? obj.name : dfault)(collection.find(d => d.id === id));
import {extendObservable, reaction} from 'mobx';
import moment from 'moment';
import axios from 'axios'
import _ from 'lodash'

const createGuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => (
    (r => c == 'x' ? r : (r & 0x3 | 0x8))(Math.random() * 16 | 0).toString(16)
));

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
            volunteers: shift.volunteers.map(v => v.profile_id)
        }, _.pick(shift, ['title', 'color']))
    }

    this.submitShift = async () => {
        if (!this.currentShift) {
            return
        }

        try {
            const method = this.currentShift.isNew ? 'post' : 'put'
            await axios(`/api/v1/departments/${this.departmentID}/shifts/${this.currentShift.id}`, 
                {credentials: 'include', data: transformShift(this.currentShift), method}
                )

            await this.refreshShifts() 
            const id = this.currentShift.id           
            this.currentShift = null
            this.focusedShift = id
            return id
        } catch (e) {
            this.editError = e.message
        }
    }
    
    this.createShift = () => {
        this.currentShift = {
            id: createGuid(),
            startDate: moment(this.date).startOf('hour').add(1, 'hours'),
            endDate: moment(this.date).startOf('hour').add(2, 'hours'),
            title: "New Shift",
            isNew: true,
            color: "#CCCCCC",
            volunteers: []
        }
    }

    this.deleteShift = async shift => {
        await axios.delete(`/api/v1/departments/${this.departmentID}/shifts/${shift.id}`)
        this.refreshShifts()
    }

    reaction(() => this.departmentID, async dept => {
        // Can optimize by connecting with volunteer-list model
        this.volunteers = (await axios(`/api/v1/departments/${dept}/volunteers`)).data
        this.refreshShifts()
    })

    reaction(() => this.currentShift, async shift => {
        this.refreshShifts()
    })

    reaction(() => [this.shifts, this.searchText, this.dateRange], ([shifts, searchText, [startDate, endDate]]) => {
        const overlaps = (a, b) => moment(a.startDate).isBefore(b.endDate) && moment(a.endDate).isAfter(b.startDate)
        this.filteredShifts = _(shifts)
            .reduce((a, v, id) => ([...a, _.assign({id}, v)]), [])
            .filter(shift => 
                overlaps(shift, {startDate, endDate}) && 
                !_.size(searchText) || _.find(_.flattenDeep([shift.title, _.map(shift.volunteers, _.values)]), 
                str => _.includes/(str.toLowerCase(), searchText.toLowerCase()))
            ).reduce((acc, shift) => {
            const overlapping = _.filter(acc, s => overlaps(s, shift))
            const overlapCount = _.size(overlapping) + 1
            _.forEach([...overlapping, shift], (o, overlapIndex) => _.assign(o, {overlapCount, overlapIndex}))
            return [...acc, shift]
        }, [])
    })

    this.initDepartments()
}

export default ShiftManagerModel;
