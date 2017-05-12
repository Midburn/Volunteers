import React from 'react';
import TimeClockComponent from "../../components/TimeClock/TimeClockComponent"
import ShiftManagerModel from "../../model/ShiftManagerModel"
const shiftManagerModel = new ShiftManagerModel();
const TimeClockRoute = () => <TimeClockComponent shiftManagerModel={shiftManagerModel} />;

export default TimeClockRoute;
