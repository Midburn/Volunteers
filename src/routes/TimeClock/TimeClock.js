import React from 'react';
import TimeClockComponent from "../../components/Shifts/ShiftManagerComponent"
import ShiftManagerModel from "../../model/ShiftManagerModel"
const shiftManagerModel = new ShiftManagerModel();
const TimeClockRoute = () => <TimeClockComponent shiftManagerModel={shiftManagerModel} />;

export default TimeClockRoute;
