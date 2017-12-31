import React from 'react';
import {ListGroup, ListGroupItem, Image, Button} from 'react-bootstrap'
import VolunteerRequestModel from "../../model/VolunteerRequestModel";
import {observer} from "mobx-react/index";
require('./VolunteerRequest.css')

const DEFAULT_LOGO = 'https://yt3.ggpht.com/-t7buXM4UqEc/AAAAAAAAAAI/AAAAAAAAAAA/n5U37nYuExw/s900-c-k-no-mo-rj-c0xffffff/photo.jpg';

const volunteerRequestModel = new VolunteerRequestModel();


const VolunteerRequest = observer(() => {
    const departments = volunteerRequestModel.departments;
    const requests = volunteerRequestModel.requests;

    if (!departments || !requests) return <div>Loading</div>;

    return (
    <div className="requests-view">
      <div className="card container">
        <h1 className="requests-title">Volunteering</h1>
        <p>
          <p style={{direction:'rtl'}}>התנדבות היא חלק בלתי נפרד מחוויית מידברן והמתנדבים הם אלו שבונים את העיר, מתפעלים אותה ולבסוף גם דואגים לפרק אותה. </p>
          Volunteering is an inseparable part of the Midburn experience. The volunteers are the ones to build, operate and teardown the city. Volunteering does not automatically award you a ticket, but this year the priority is to allot tickets to volunteers in the different departments.
        </p>
        <ListGroup className="requests-list">
          {departments.map(department => {
            const basicInfo = department.basicInfo;
            const departmentLogo = basicInfo.imageUrl ? basicInfo.imageUrl : DEFAULT_LOGO; 
            const requestState = volunteerRequestModel.requestState(department._id);
            return (
            <ListGroupItem key={department._id}>
              <div className="requests-department-top">
                <Image src={departmentLogo} className="request-department-logo"></Image>
                <h2 className="requests-department-title">{basicInfo.nameEn} - {basicInfo.nameHe}</h2>
                {requestState === 'Opened' &&
                  <Button bsStyle="primary" className="request-join-button" 
                          onClick={() => volunteerRequestModel.handleSendRequest(department._id)}>Join</Button>}
                {requestState === 'Closed' && null} 
                {requestState === 'Cancel' &&
                  <Button bsStyle="primary" className="request-join-button" 
                          onClick={() => volunteerRequestModel.handleCancelRequest(department._id)}>Cancel</Button>}
              </div>
              <p className="requests-department-text">
                <p style={{direction:'rtl'}}>{basicInfo.descriptionHe}</p>
                {basicInfo.descriptionEn}
              </p>
            </ListGroupItem>
          )})}
        </ListGroup>
      </div>
    </div>
)});

export default observer(VolunteerRequest);
