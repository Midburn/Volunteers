import {observer} from "mobx-react";
import React from 'react';
import {Modal, Button, Image} from 'react-bootstrap'
import FillFormView from './FillFormView'
import FillUserDataView from './FillUserDataView'
import * as Consts from '../../model/consts'
require('./JoinProcessView.scss');

const getPhase = joinProcess => {
    if (!joinProcess.userData.profileEmail) {
        return 'userData';
    }
    if (!joinProcess.filledGeneral) {
        return 'general';
    }
    if (!joinProcess.filledDepartment) {
        return 'department';
    }
    if (!joinProcess.requestSent) {
        return 'request';
    }
    return 'done';
}

const phaseView = (phase ,volunteerRequestModel) => {
    if (phase === 'userData') {
        return userDataPhase(volunteerRequestModel);
    }
    if (phase === 'general') {
        return generalPhase(volunteerRequestModel);
    }
    if (phase === 'department') {
        return departmentPhase(volunteerRequestModel);
    }
    return donePhase(volunteerRequestModel.joinProcess.language);
}

const userDataPhase = volunteerRequestModel => {
    return (
        <FillUserDataView language={volunteerRequestModel.joinProcess.language}
                        onAnswer={checkUserData(volunteerRequestModel)}/>
    );
}

const generalPhase = volunteerRequestModel => {
    const joinProcess = volunteerRequestModel.joinProcess;
    const generalQuestions = joinProcess.generalQuestions;
    return <FillFormView key="general-form" questions={generalQuestions} language={joinProcess.language}
                        onAnswer={sendGeneralForm(volunteerRequestModel)}/>
}

const departmentPhase = volunteerRequestModel => {
    const joinProcess = volunteerRequestModel.joinProcess;
    const departmentQuestions = joinProcess.departmentQuestions;
    return <FillFormView key="departement-form" questions={departmentQuestions} language={joinProcess.language}
                        onAnswer={sendDepartmentForm(volunteerRequestModel)}/>
}

const donePhase = language => {
    return (
    <div className="done-join">
        <h2>{language==='he' ? 'תודה' : 'Thank You'}</h2>
        <h5>{language==='he' ? 'בקשתך נשלחה' : 'Your request was sent'}</h5>
        <Image src="https://upload.wikimedia.org/wikipedia/commons/b/b3/Symbol_great.svg"/>
        <h3>
        {language==='he' ? 'אם אין לך פרופיל מידברן לחץ' : 'If you don\'t have a midburn profile please create one'}
            <a href="https://profile.midburn.org/en/user/register">{language==='he' ? ' כאן' : ' here'}</a><br/>
            <h5>{language==='he' ? 'זה דרוש בשביל להשתתף במידברן' : 'This is needed for participating in Midburn.'}</h5>
        </h3>
    </div>
    )
}

const checkUserData = volunteerRequestModel => userData => {
    volunteerRequestModel.checkUserData(userData);
}

const sendGeneralForm = volunteerRequestModel => answers => { 
    volunteerRequestModel.sendGeneralForm(answers);
}

const sendDepartmentForm = volunteerRequestModel => answers => { 
    volunteerRequestModel.sendDepartmentForm(answers);
}

const joinProcessView = observer(({volunteerRequestModel}) => {
    const show = !!volunteerRequestModel.joinProcess.departmentId;
    const joinProcess = volunteerRequestModel.joinProcess;
    const loading =  joinProcess.loading || !show; 
    const error = joinProcess.error;
    const phase = getPhase(joinProcess);
    const language = joinProcess.language;

    const toggleLan = () => volunteerRequestModel.toggleLanguage();
    const close = () => volunteerRequestModel.stopJoinProcess();

    const department = volunteerRequestModel.departments.find(d => d._id === joinProcess.departmentId);
    const departmentLogo = department && department.basicInfo && department.basicInfo.imageUrl ? department.basicInfo.imageUrl : Consts.DEFAULT_LOGO;

    return (
    <Modal className="join-process-modal" show={show} onHide={close} bsSize="lg">
        <Modal.Header closeButton>
            <Modal.Title>
            <Image src={departmentLogo} className="department-logo"></Image>
            <span className="title">Join Us</span>
            <Button className="lan-btn" bsStyle="link" onClick={toggleLan}>{language === 'he' ? 'English' : 'עברית'}</Button>
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
        {error 
            ? <div>Error...</div> 
            : loading || phase==='request'
                ? <div>Loading...</div>
                : phaseView(phase, volunteerRequestModel)
        }
        </Modal.Body>
    </Modal> 
    )})

export default joinProcessView;
