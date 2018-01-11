import {observer} from "mobx-react";
import React from 'react';
import {Modal, Button, Image} from 'react-bootstrap'
import FillFormView from './FillFormView'
import * as Consts from '../../model/consts'
require('./JoinProcessView.scss');

const getPhase = joinProcess => {
    let phase = 'general';
    if (joinProcess.filledGeneral && joinProcess.filledDepartment) {
        phase = 'done'
    } else if (joinProcess.filledGeneral) {
        phase = 'department'
    }
    return phase;
}

const phaseView = (phase ,joinProcess) => {
    if (phase === 'general') {
        return generalPhase(joinProcess);
    }
    if (phase === 'department') {
        return departmentPhase(joinProcess);
    }
    return donePhase();
}

const generalPhase = joinProcess => {
    const generalQuestions = joinProcess.generalQuestions;
    const generalAnswer = joinProcess.generalAnswer;
    return <FillFormView questions={generalQuestions} language={joinProcess.language} onAnswer={this.sendGeneralForm}/>
}

const departmentPhase = joinProcess => {
    const departmentQuestions = joinProcess.departmentQuestions;
    const departmentAnswer = joinProcess.departmentAnswer;
    return <div>department form</div>
}

const donePhase = () => {
    return <div>done</div>
}

const sendGeneralForm = answers => { 
    volunteerRequestModel.sendGeneralForm(answers);
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
            : phaseView(phase, joinProcess)
        }
        </Modal.Body>
    </Modal> 
    )})

export default joinProcessView;
