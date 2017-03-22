import React from 'react';
import {Modal, OverlayTrigger, Button} from 'react-bootstrap';
import update from 'immutability-helper';

import DropdownFilter from '../DropdownFilter/DropdownFilter.js';
import DropdownConverter from '../../DropdownConverter.js'



export default class VolunteerEditModal extends React.Component{
    constructor(props){
        super(props);
        this.state={volunteer:{}};

        this.handleCancel=this.handleCancel.bind(this);
        this.handleSubmit=this.handleSubmit.bind(this);
        this.handleReset=this.handleReset.bind(this);

        this.handleInputChange= this.handleInputChange.bind(this);
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
        this.handleReset();
        this.props.onHide();
    }

    handleSubmit(){
        console.log('VolunteerEditModal.handleSubmit');
        let diff = Object.keys(this.state.volunteer).reduce((acc,cur)=>{
            if (this.state.volunteer[cur]!==undefined && this.state.volunteer[cur]!==this.props.volunteer[cur])
                acc[cur] = this.state.volunteer[cur];
                return acc;
        },{});
        console.log(diff);

        this.handleReset();
        this.props.onSubmit(diff)
    }
    
    handleReset(){
        this.setState( {volunteer:{}} );
    }

    render(){
        console.log('VolunteerEditModal.render');
        let displayedVolunteer = this.calcDisplayedVolunteer();
        console.log(displayedVolunteer);

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
                                    ['Manager','Day Manager','Shift Manager','Production','Department Manager','Volunteer','Team Leader'].map(
                                    (option)=> <option value={option} key={option}>{option}</option>
                                    )    
                                }
                            </select>
                        </div>
                    </div>

                     <div className="form-group row">
                        <label htmlFor="Volunteer Type" className="col-sm-4 col-form-label">Volunteer Type</label>
                        <div className="col-sm-10">
                            <select
                                onChange ={this.getInputChangeHandler('volunteer_type')}
                                value={displayedVolunteer.volunteer_type}
                                className="form-control" 
                                id="Volunteeer Type">
                                {
                                    ['Manager','Day Manager','Shift Manager','Production','Department Manager'].map(
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

                    <div className="form-group row">
                        <label htmlFor="Got Ticket" className="col-sm-4 col-form-label">Got Ticket</label>
                        <div className="col-sm-10">
                            <select
                                onChange ={this.getInputChangeHandler('got_ticket')}
                                value={displayedVolunteer.got_ticket}
                                className="form-control" 
                                id="Got Ticket">
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