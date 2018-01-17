import React from 'react';
import {ListGroup, ListGroupItem, Image, Button} from 'react-bootstrap'
import JoinProcessView from './JoinProcessView'
import VolunteerRequestModel from "../../model/VolunteerRequestModel";
import * as Consts from '../../model/consts'
import {observer} from "mobx-react/index";
require('./VolunteerRequest.css')

const volunteerRequestModel = new VolunteerRequestModel();

const VolunteerRequest = observer(() => {
    const departments = volunteerRequestModel.departments;
    const requests = volunteerRequestModel.requests;

    if (!departments || !requests) return <div>Loading</div>;

    return (
    <div className="requests-view">
      <div className="card container">
        <h1 className="requests-title">Volunteering</h1>
        <div style={{direction:'rtl'}}>התנדבות היא חלק בלתי נפרד מחוויית מידברן והמתנדבים הם אלו שבונים את העיר, מתפעלים אותה ולבסוף גם דואגים לפרק אותה. </div>
        <div>Volunteering is an inseparable part of the Midburn experience. The volunteers are the ones to build, operate and teardown the city. </div>
        <div><br/>* Join requests are coming soon</div>
        <ListGroup className="requests-list">
          {departments.map(department => {
            const basicInfo = department.basicInfo;
            const departmentLogo = basicInfo.imageUrl ? basicInfo.imageUrl : Consts.DEFAULT_LOGO;
            const requestState = volunteerRequestModel.requestState(department._id);
            return (
            <ListGroupItem key={department._id}>
              <div className="requests-department-top">
                <Image src={departmentLogo} className="request-department-logo"/>
                <h2 className="requests-department-title">{basicInfo.nameEn} - {basicInfo.nameHe}</h2>
                {requestState === 'Opened' &&
                  <Button bsStyle="primary" disabled className="request-join-button"
                          onClick={() => volunteerRequestModel.startJoinProcess(department._id)}>Join</Button>}
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

      <JoinProcessView volunteerRequestModel={volunteerRequestModel} />

    </div>
)});

export default observer(VolunteerRequest);
