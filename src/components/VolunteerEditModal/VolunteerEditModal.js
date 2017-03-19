import React from 'react';
import {Modal, OverlayTrigger, Button} from 'react-bootstrap';
import DropdownFilter from '../DropdownFilter/DropdownFilter.js';



export default class VolunteerEditModal extends React.Component{
    constructor(props){
        super(props);
        this.state={};
        this.handleCancel=this.handleCancel.bind(this);
        this.handleSubmit=this.handleSubmit.bind(this);
    }
    handleCancel(){
        this.props.onHide();
    }
    handleSubmit(){
        this.props.onHide();
    }
    render(){
                console.log('Modal Rended');

        console.log(this.props);

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
                <label for="Role" className="col-sm-4 col-form-label">Role</label>
                <div className="col-sm-10">
                    <select
                      onChange ={()=>false}
                value="Manager"
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
                <label for="Production" className="col-sm-4 col-form-label">Production</label>
                <div className="col-sm-10">
                    <select
                      onChange ={()=>false}
                value={this.props.volunteer.is_production?'Yes':'No'}
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