import React from 'react';
import {Modal, OverlayTrigger, Button} from 'react-bootstrap';
import update from 'immutability-helper';

import DropdownFilter from '../DropdownFilter/DropdownFilter.js';



export default class VolunteerEditModal extends React.Component{
    constructor(props){
        super(props);
        this.state={volunteer:{}};
        this.handleCancel=this.handleCancel.bind(this);
        this.handleSubmit=this.handleSubmit.bind(this);
        this.handleReset=this.handleReset.bind(this);

        this.handleChangeProduction=this.handleChangeProduction.bind(this);
        this.calcValueProduction= this.calcValueProduction.bind(this);
        this.handleChageRole=this.handleChangeRole.bind(this);
    }

    handleChangeRole(e){
        console.log(e);
        this.setState({volunteer:{role:e.target.value}});
    }

    calcValueRole(){
            return this.state.volunteer.role!==undefined? this.state.volunteer.role: this.props.volunteer.role;
    }

    calcValueProduction(){
        return (this.state.volunteer.is_production!==undefined ? this.state.volunteer.is_production: this.props.volunteer.is_production)?
            'Yes':
            'No';
    }

    handleChangeProduction(e){
        console.log('handleChangeProduction');
        console.log(e);
        this.setState( {volunteer:{is_production: e.target.value==='Yes'}} );

    }

    
    handleCancel(){
        this.props.onHide();
    }

    handleSubmit(){
        console.log('Modal.handleSubmit');

        let newState={};
        if (this.state.volunteer.is_production!==undefined && this.state.volunteer.is_production!==this.props.volunteer.is_prodcution)
            newState.is_production= this.state.volunteer.is_production;
        if(this.state.volunteer.role!==undefined && this.state.volunteer.role!==this.props.volunteer.role)
            newState.role=this.state.volunteer.role;
        
        console.log(newState);
        this.props.onSubmit(newState)
    }
    handleReset(){
        console.log('VolunteerEditModal.handleReset called');
        this.setState( {volunteer:{}} );

    }

    render(){
        console.log('VolunteerEditModal.render');
        console.log('props');

        console.log(this.props);
        console.log('state');
        console.log(this.state);


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
                            <select
                                onChange ={this.handleChange}
                                value={this.calcValueRole()}
                                className="form-control" 
                                id="Role">
                                {
                                    ['All','Manager','Day Manager','Shift Manager','Production','Department Manager'].map(
                                    (option)=> <option value={option} key={option}>{option}</option>
                                    )    
                                }
                            </select>
                        </div>
                    </div>

                    <div className="form-group row">
                        <label htmlFor="Production" className="col-sm-4 col-form-label">Production</label>
                        <div className="col-sm-10">
                            <select
                                onChange ={this.handleChangeProduction}
                                value={this.calcValueProduction()}
                                className="form-control" 
                                id="Production">
                                {
                                    ['Yes','No'].map(
                                    (option)=> <option value={option} key={option}>{option}</option>
                                    )    
                                }
                            </select>
                        </div>
                    </div>
                </form>
            </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleCancel}>Cancel</Button>
            <Button onClick={this.handleReset}>Reset</Button>
            <Button onClick={this.handleSubmit}>Submit</Button>
          </Modal.Footer>
        </Modal>
        )
    }
}