import React from 'react';

import VolunteerRequestModel from "../../model/VolunteerRequestModel";
import {observer} from "mobx-react/index";

const volunteerRequestModel = new VolunteerRequestModel();


const VolunteerRequest = observer(() => {
    const departments = volunteerRequestModel.departments;
    const requests = volunteerRequestModel.requests;

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
                        <span className="pressable"
                              onClick={() => volunteerRequestModel.handleCancelRequest(department._id)}>Cancel request</span>;
                }
            }
            else {
                departmentAction =
                    <span className="pressable"
                          onClick={() => volunteerRequestModel.handleSendRequest(department._id)}>Send request</span>;
            }

            return <div key={department._id}>
                {department.nameEn} - {departmentAction}
            </div>
        })}
    </div>;
});

export default observer(VolunteerRequest);
