import React, { Component } from 'react';
import axios from 'axios';
import {Button, FormGroup, FormControl, HelpBlock, Image, Table} from 'react-bootstrap'
import update from 'immutability-helper';

export default class AdminView extends Component {
  state = {
    departments: [],
    newDepartmentNameEn: '',
    newDepartmentNameHe: '',
    newDepartmentImageURL: '',

    admins: [],
    newAdmin: '',
    newEmailError: ''
  };

  getInputChangeHandler = (field) => {
    return (event) => this.handleChange(field,event);
}

  handleChange = (field, event) => {
      let val = event.target.value;

      this.state.errorTexts = []
      this.setState( (state) => update(state, {$merge:{[field]: val}} ));
  }

  addDepartment = () => {
    axios.post("/api/v1/departments", {
      nameEn: this.state.newDepartmentNameEn,
      nameHe: this.state.newDepartmentNameHe,
      imageUrl: this.state.newDepartmentImageURL
    })
    .then(res => {
      this.state.newDepartmentNameEn = '';
      this.state.newDepartmentNameHe = '';
      this.state.newDepartmentImageURL = '';
      const departments = res.data;
      this.setState(state => update(state, {departments: {$set:departments}}))
    })
  };

  deleteDepartment = (department) => {
    console.log("HERRRRRRRRE");
    axios.delete(`/api/v1/departments/${department._id}`)
    .then(res => {
      const departments = res.data;
      this.setState(state => update(state, {departments: {$set:departments}}))
    })
  };

  componentDidMount() {
    axios.get("/api/v1/departments")
    .then(res => {
      const departments = res.data;
      this.setState(state => update(state, {departments: {$set:departments}}))
    })
    axios.get("/api/v1/permissions/admins")
    .then(res => {
      const admins = res.data;
      this.setState(state => update(state, {admins: {$set:admins}}))
    })
    .catch()
  };

  render() {
    const { admins, departments } = this.state;
    if (!admins || !departments) {
      return <div>Loading</div>;
    }

    console.log(admins);
    console.log(departments);

    return (
      <div>
        <div className="container card">
          <h1>Departments</h1>
            <Table bordered hover>
              <thead>
                <tr>
                  <th width='150px'>Logo</th>
                  <th>Name</th>
                  <th>שם</th>
                  <th width='150px'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map(department => {
                  return (
                    <tr>
                      <td style={{textAlign: 'center'}}><Image src={department.imageUrl ? department.imageUrl : "Ic_delete.png"} style={{width: 90, height: 60}}></Image></td>
                      <td>{department.nameEn}</td>
                      <td>{department.nameHe}</td>
                      <td><Image src="Ic_delete.png" onClick={() => {this.deleteDepartment(department)}} style={{width: 30, height: 30}}/></td>
                    </tr>
                  )
                })}
                <tr>
                <td><FormControl type="text" 
                  value={this.state.newDepartmentImageURL} 
                  placeholder="Logo URL"
                  onChange={this.getInputChangeHandler('newDepartmentImageURL')}
                />
                </td>
                <td><FormControl type="text" 
                value={this.state.newDepartmentNameEn} 
                placeholder="Enter name (English)"
                onChange={this.getInputChangeHandler('newDepartmentNameEn')}
                />
                </td>
                <td><FormControl type="text" 
                  value={this.state.newDepartmentNameHe} 
                  placeholder="Enter name (Hebrew)"
                  onChange={this.getInputChangeHandler('newDepartmentNameHe')}
                />
                </td>
                <td>
                <Button onClick={this.addDepartment} bsStyle="primary">Add Department</Button>
                  </td>
                </tr>
              </tbody>
            </Table>
          {/* <FormGroup controlId="new-department-input-en">
            <FormControl type="text" 
            value={this.state.newDepartmentNameEn} 
            placeholder="Enter name (English)"
            onChange={this.getInputChangeHandler('newDepartmentNameEn')}
            />
            <FormControl type="text" 
              value={this.state.newDepartmentNameHe} 
              placeholder="Enter name (Hebrew)"
              onChange={this.getInputChangeHandler('newDepartmentNameHe')}
            />
            <FormControl type="text" 
              value={this.state.newDepartmentImageURL} 
              placeholder="Enter image URL (optional)"
              onChange={this.getInputChangeHandler('newDepartmentImageURL')}
            />
          </FormGroup>
          <Button onClick={this.addDepartment} bsStyle="primary">Add Department</Button> */}
        </div>
        
        <div className="container card container">
          <h1>Admins</h1>
          {admins.map(admin => {
            return (
              <div key={admin._id}>
              <span>{admin.userId}</span>
              </div>
            )
          })}
          <FormGroup controlId="formBasicText">
              <FormControl
                type="text"
                value={this.state.newAdmin}
                placeholder="Enter email"
              />
              <HelpBlock>{this.state.newEmailError}</HelpBlock>
            </FormGroup>
          <Button bsStyle="primary">Add Admin</Button>
        </div>
      </div>
    );
  }
}
