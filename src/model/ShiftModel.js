import {extendObservable, reaction} from 'mobx';
import moment from 'moment';

const useMockData = location.search.match(/[&?]useMockData/i)

function ShiftModel() {
    extendObservable(this, {
        id: 0,
        startDate: new Date,
        endDate: new Date,
        durationMinutes: 0,
        deleted: false,
        volunteers: []
    });

    this.del = async function() {
        this.deleted = true;
        fetch(`/api/v1/shifts/${this.id}`, {method: 'delete'})
    }

    this.save = async function() {
        fetch(`/api/v1/shifts/${this.id}`, {credentials: 'include', method: 'post', headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json' }, body: JSON.stringify({
                startDate: moment(this.startDate).unix(),
                endDate: moment(this.endDate).unix(),
                volunteers: this.volunteers.map(v => v.id)                
            })
        })
    }
}

export default ShiftManagerModel;
