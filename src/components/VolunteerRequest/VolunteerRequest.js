import React from 'react';
import axios from "axios";

class VolunteerRequest extends React.Component {
    static async fetchVolunteerRequest() {
        // todo: get mail form main state
        const requests = await axios.get(
            "/api/v1/volunteer-requests",
            {email: "shaytidhar@gmail.com"},
            {credentials: 'include'});

        const requestStatus = {};

        for (let index = 0; index < requests.data.length; index++) {
            requestStatus[requests.data[index]["departmentId"]] = requests.data[index]["approved"]
        }

        return requestStatus;
    }

    constructor(props) {
        super(props);

        this.state = {departments: null, requests: null};

        this.handleCancelRequest = this.handleCancelRequest.bind(this);
        this.handleSendRequest = this.handleSendRequest.bind(this);
    }

    componentDidMount() {
        // TODO: fetch from model???
        VolunteerRequest.fetchVolunteerRequest()
            .then(requests =>
                this.setState({
                    departments: [{_id: "1", nameEn: "Tech"}, {_id: "2", nameEn: "Salon"}, {_id: "3", nameEn: "Fire"}],
                    requests: requests
                }));
    }

    handleCancelRequest(departmentId) {
        const requests = {...this.state.requests};
        delete requests[departmentId];
        this.setState({requests: requests});

        const eventId = "1";
        // todo: add current event and check if request succeed
        axios.delete(
            `/api/v1/departments/${departmentId}/events/${eventId}/requests`,
            {
                data: {
                    email: "shaytidhar@gmail.com",
                    credentials: 'include'
                }
            });
    }

    handleSendRequest(departmentId) {
        this.setState({requests: {...this.state.requests, [departmentId]: false}});

        const eventId = "1";
        // todo: add current event and check if request succeed
        axios.post(
            `/api/v1/departments/${departmentId}/events/${eventId}/requests`,
            {email: "shaytidhar@gmail.com"},
            {credentials: 'include'});
    }

    render() {
        const {departments, requests} = this.state;

        if (!departments || !requests) return <div>Loading</div>;

        return <div>
            <h1>Let's go!</h1>
            {departments.map(department => {
                let departmentAction = null;
                if (department._id in requests) {
                    if (requests[department._id]) {
                        departmentAction = <span>Approved!</span>;
                    }
                    else {
                        departmentAction =
                            <span className="pressable" onClick={() => this.handleCancelRequest(department._id)}>Cancel request</span>;
                    }
                }
                else {
                    departmentAction =
                        <span className="pressable"
                              onClick={() => this.handleSendRequest(department._id)}>Send request</span>;
                }

                return <div key={department._id}>
                    {department.nameEn} - {departmentAction}
                </div>
            })}
        </div>;
    }
}

export default VolunteerRequest;
