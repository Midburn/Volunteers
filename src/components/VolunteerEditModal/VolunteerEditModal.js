import React from 'react';
import {Modal, OverlayTrigger, Button} from 'react-bootstrap';
import update from 'immutability-helper';
import axios from 'axios';

import DropdownFilter from '../DropdownFilter/DropdownFilter.js';
import DropdownConverter from '../../DropdownConverter.js'



export default class VolunteerEditModal extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            volunteer:{
                role: this.props.volunteer.role,
                is_production: this.props.volunteer.is_production
            },
            errorTexts: [],
            isButtonEnabled: true
        };

        this.handleCancel=this.handleCancel.bind(this);
        this.handleSubmit=this.handleSubmit.bind(this);
        this.handleReset=this.handleReset.bind(this);

        this.handleInputChange= this.handleInputChange.bind(this);
        this.getRolesOptions=this.getRolesOptions.bind(this)
    }

    calcDisplayedVolunteer(){
        let converter = new DropdownConverter();
        let merged = update(this.props.volunteer,{$merge:this.state.volunteer});
        let disp = Object.keys( merged
            ).reduce(
                (acc,cur) => {acc[cur] = converter.convertToDisplay(merged[cur]);return acc;}
                ,
                {});
        return disp;
    }

    getInputChangeHandler(field){
        return (event) => this.handleInputChange(field,event);
    }

    handleInputChange(field,event){
        console.log('VolunteerEditModal.handleInputChange');
        let converter = new DropdownConverter();

        let val= event.target.value;
        this.setState( (state) => update(state,{volunteer:{$merge:{[field]:converter.convertFromDisplay(val)}}} ));
     //   this.setState((state)=> {volunteer: {...(state.volunteer),[field]: converter.ConvertFromDisplay(event.target.value)}})
    }
    
    handleCancel(){
        this.props.onHide();
    }

    handleSubmit(){
        console.log('VolunteerEditModal.handleSubmit');
        // display error if no changes were made
        if(this.state.volunteer.role === this.props.volunteer.role 
            && this.state.volunteer.is_production === this.props.volunteer.is_production) {
            this.state.errorTexts = ['No Changes have been made']
            this.setState(this.state)
            return;
        }
        
        // edit requst
        const dept_id = this.props.volunteer.department_id;
        const profile_id = this.props.volunteer.profile_id;

        this.state.errorTexts = ['Editing... ']
        this.state.isButtonEnabled = false
        this.setState(this.state)

        axios
        .put(`/api/v1/departments/${dept_id}/volunteers/${profile_id}`, this.state.volunteer)
        .then(res => {
            this.props.onSuccess();
            this.state.isButtonEnabled = true
            this.state.errorTexts = ['Great Success!']
            this.setState(this.state)
        })
        .catch(error => {
            this.logNetworkError
            this.state.errorTexts = ['Server Error']
            this.state.isButtonEnabled = true
            this.setState(this.state)
        });
    }

    getRolesOptions(){
        if (this.props.roles == undefined || this.props.roles.length == 0) {
            return ["All"]
        }
        var roles =  this.props.roles.map(function(role) {return role['name']})
        return roles
    }

    getErrorText = () => (
        <ul>{this.state.errorTexts.map((text, index) => <li key={`li-${index}`}>{text}</li>)}</ul>
    )

    render(){
        console.log('VolunteerEditModal.render');
        let displayedVolunteer = this.calcDisplayedVolunteer();
        console.log(displayedVolunteer);
        console.log(this.props.volunteer);

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
                                onChange ={this.getInputChangeHandler('role')}
                                value={displayedVolunteer.role}
                                className="form-control" 
                                id="Role">
                                {
                                    this.getRolesOptions().map(
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
                                onChange ={this.getInputChangeHandler('is_production')}
                                value={displayedVolunteer.is_production}
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
                {this.getErrorText()}
            </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleCancel}>Cancel</Button>
            <Button onClick={this.handleReset}>Reset</Button>
            <Button onClick={this.handleSubmit} disabled={!this.state.isButtonEnabled}>Submit</Button>
          </Modal.Footer>
        </Modal>
        )
    }
}