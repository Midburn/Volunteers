import React from 'react';
import {Modal, OverlayTrigger, Button} from 'react-bootstrap';
import update from 'immutability-helper';

import DropdownFilter from '../DropdownFilter/DropdownFilter.js';
import DropdownConverter from '../../DropdownConverter.js'


export default class VolunteerEditModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {role: null};

        this.handleCancel = this.handleCancel.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.handleRoleChange = this.handleRoleChange.bind(this);
    }

    handleRoleChange(event) {
        const updatedRole = event.target.value;
        this.setState({role: updatedRole});
    }

    handleCancel() {
        this.props.onHide();
    }

    handleSubmit() {
        this.props.onSubmit(this.state.role);
        this.props.onHide();
    }

    render() {
        return (
            <Modal show={this.props.show} onHide={this.handleCancel}>
                <Modal.Header closeButton>
                    <Modal.Title>Editing {this.props.volunteer.first_name} {this.props.volunteer.last_name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form>
                        <div className="form-group row">
                            <label className="col-sm-4 col-form-label">First Name</label>
                            <div className="col-sm-8">
                                <p className="form-control-static">{this.props.volunteer.first_name}</p>
                            </div>
                        </div>

                        <div className="form-group row">
                            <label className="col-sm-4 col-form-label">Last Name</label>
                            <div className="col-sm-8">
                                <p className="form-control-static">{this.props.volunteer.last_name}</p>
                            </div>
                        </div>

                        <div className="form-group row">
                            <label className="col-sm-4 col-form-label">Email</label>
                            <div className="col-sm-8">
                                <p className="form-control-static">{this.props.volunteer.email}</p>
                            </div>
                        </div>

                        <div className="form-group row">
                            <label htmlFor="Role" className="col-sm-4 col-form-label">Role</label>
                            <div className="col-sm-10">
                                <select onChange={this.handleRoleChange}
                                        value={this.props.volunteer.role}
                                        className="form-control"
                                        id="Role"
                                        defaultValue={this.props.volunteer.role_id}>
                                    {this.props.roles.map(role =>
                                        <option value={role.id}key={role.id}>{role.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="form-group row">
                            <label htmlFor="Production" className="col-sm-4 col-form-label">Production</label>
                            <div className="col-sm-10">
                                <select readOnly="true" value={this.props.volunteer.is_production}
                                        className="form-control"
                                        id="Production">
                                    {['Yes', 'No'].map((option) => <option value={option}
                                                                           key={option}>{option}</option>)}
                                </select>
                            </div>
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.handleCancel}>Cancel</Button>
                    <Button onClick={this.handleSubmit}>Submit</Button>
                </Modal.Footer>
            </Modal>
        )
    }
}