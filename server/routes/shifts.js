const express = require('express');
const router = express.Router();
const Shift = require('../models/shift');
const co = require('co');
const _ = require('lodash');

router.get('/departments/:departmentId/shifts', co.wrap(function*(req, res) {
    const departmentId = req.params.departmentId;

    const shifts = yield Shift.find({departmentId: departmentId});
    return res.json(shifts);
}));

router.post('/departments/:departmentId/shifts/:shiftId', co.wrap(function*(req, res) {
    const departmentId = req.params.departmentId;
    const shiftId = req.params.shiftId;

    const shift = new Shift({
        '_id': shiftId,
        'title': req.body.title,
        'color': req.body.color,
        'departmentId': departmentId,
        'startDate': req.body.startDate,
        'endDate': req.body.endDate,
        'volunteers': req.body.volunteers
    });

    yield shift.save();

    return res.json(shift);
}));

router.put('/departments/:departmentId/shifts/:shiftId', co.wrap(function*(req, res) {
    const departmentId = req.params.departmentId;
    const shiftId = req.params.shiftId;

    const updatedShift = {
        'title': req.body.title,
        'color': req.body.color,
        'startDate': req.body.startDate,
        'endDate': req.body.endDate,
        'volunteers': req.body.volunteers
    };

    const shift = yield Shift.findOne({_id: shiftId, departmentId: departmentId});

    if (_.isEmpty(shift)) return res.status(400).json({error: `Shift ${shiftId} is not exists`});

    for (const key in updatedShift) {

        shift[key] = updatedShift[key] || shift[key];
    }

    yield shift.save();

    return res.json(shift);
}));

router.delete('/departments/:departmentId/shifts/:shiftId', co.wrap(function*(req, res) {
    const departmentId = req.params.departmentId;
    const shiftId = req.params.shiftId;

    const shift = yield Shift.findOne({_id: shiftId, departmentId: departmentId});

    if (_.isEmpty(shift)) return res.status(400).json({error: `Shift ${shiftId} is not exists`});

    yield shift.remove();

    return res.json(shift);
}));

module.exports = router;
