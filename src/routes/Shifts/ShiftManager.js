import React from 'react';
import ShiftManagerComponent from "../../components/Shifts/ShiftManagerComponent"
import ShiftManagerModel from "../../model/ShiftManagerModel"
const shiftManagerModel = new ShiftManagerModel();
const ShiftManagerRoute = () => <ShiftManagerComponent shiftManagerModel={shiftManagerModel} />;

export default ShiftManagerRoute;
