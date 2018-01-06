import {observer} from "mobx-react";
import React from 'react';
import {Modal, Button, Image} from 'react-bootstrap'
import * as Consts from '../../model/consts'
require ('./JoinProcessView.scss');

const joinProcessView = observer(({volunteerRequestModel}) => {
    const show = !!volunteerRequestModel.joinProcess
    const close = () => volunteerRequestModel.stopJoinProcess();

    const isValid = true;
    const departmentLogo = Consts.DEFAULT_LOGO;

    return (
    <Modal className="join-process-modal" show={show} onHide={close} bsSize="lg">
        <Modal.Header closeButton>
            <Modal.Title>
            <Image src={departmentLogo} className="department-logo"></Image>
            <span className="title">Join Us</span>
            <Button className="save" bsStyle="success" disabled={!isValid}
                    onClick={this.save}>Send</Button>
            </Modal.Title>
        </Modal.Header>

        <Modal.Body>One fine body...</Modal.Body>
    </Modal> 
    )})

export default joinProcessView;
