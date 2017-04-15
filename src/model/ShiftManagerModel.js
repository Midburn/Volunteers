const  getNameById = (collection, id, dfault = "All") => (obj => obj ? obj.name : dfault)(collection.find(d => d.id === id));
import {extendObservable, reaction} from 'mobx';
import moment from 'moment';
import axios from 'axios'

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

        shiftStatusID: null,
        shiftStatuses: [{name: "Open", id: "open"}, {name: "Closed", id: "closed"}],
        get shiftStatusName() {
            return getNameById(this.shiftStatuses, this.shiftStatusID);
        },
        date: new Date(),
        weekView: true,
        currentShift: null,
        shifts: [],
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
        this.departments = (await axios('/api/v1/departments', {credentials: 'include'})).data
        console.log(this.departments)
    }

    function transformShift(shift) {
        _.assign({
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
            const response = await axios(`/api/v1/departments/${this.departmentID}/shifts/${this.currentShift.id}`, 
                {credentials: 'include', data: transformShift(this.currentShift), method}
                )
            this.currentShift = null
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

    reaction(() => this.departmentID, async dept => {
        // Can optimize by connecting with other model
        this.volunteers = (await axios(`/api/v1/departments/${dept}/volunteers`)).data
        this.shifts = await (axios(`/api/v1/departments/${dept}/shifts`)).data
    })

    this.initDepartments()
}

export default ShiftManagerModel;
