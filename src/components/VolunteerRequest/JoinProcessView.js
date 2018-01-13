import {observer} from "mobx-react";
import React from 'react';
import {Modal, Button, Image} from 'react-bootstrap'
import FillFormView from './FillFormView'
import * as Consts from '../../model/consts'
require('./JoinProcessView.scss');

const getPhase = joinProcess => {
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
    if (phase === 'general') {
        return generalPhase(volunteerRequestModel);
    }
    if (phase === 'department') {
        return departmentPhase(volunteerRequestModel);
    }
    if (phase === 'request') {
        return requestPhase(volunteerRequestModel);
    }
    return donePhase();
}

const generalPhase = volunteerRequestModel => {
    const joinProcess = volunteerRequestModel.joinProcess;
    const generalQuestions = joinProcess.generalQuestions;
    const generalAnswer = joinProcess.generalAnswer;
    return <FillFormView questions={generalQuestions} language={joinProcess.language}
                        onAnswer={sendGeneralForm(volunteerRequestModel)}/>
}

const departmentPhase = volunteerRequestModel => {
    const joinProcess = volunteerRequestModel.joinProcess;
    const departmentQuestions = joinProcess.departmentQuestions;
    const departmentAnswer = joinProcess.departmentAnswer;
    return <FillFormView questions={departmentQuestions} language={joinProcess.language}
        onAnswer={sendDepartmentForm(volunteerRequestModel)}/>
}

const requestPhase = volunteerRequestModel => {
    const joinProcess = volunteerRequestModel.joinProcess;
    const departmentQuestions = joinProcess.departmentQuestions;
    const departmentAnswer = joinProcess.departmentAnswer;
    return <Button className="lan-btn" bsStyle="link" onClick={volunteerRequestModel.sendRequest}>Send</Button>
}

const donePhase = () => {
    return <div>done</div>
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
    const loading =  joinProcess.loading;
    const phase = getPhase(joinProcess);
    const language = joinProcess.language;

    const toggleLan = () => volunteerRequestModel.toggleLanguage();
    const close = () => volunteerRequestModel.stopJoinProcess();
    const isValid = true;
    const departmentLogo = Consts.DEFAULT_LOGO;

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
        {loading 
            ? <div>Loading...</div> 
            : phaseView(phase, volunteerRequestModel)
        }
        </Modal.Body>
    </Modal> 
    )})

export default joinProcessView;
