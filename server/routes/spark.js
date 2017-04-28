const express = require('express');
const router = express.Router();
const co = require('co');
const _ = require('lodash');
const SparkFacade = require('../spark/spark');

const devMode = (process.env.ENVIRONMENT == 'debug');
const SPARK_HOST = process.env.SPARK_HOST;

const sparkFacade = new SparkFacade(SPARK_HOST);

const handleSparkProxy = handler => (req, res) => {
    console.log(`${req.method.toUpperCase()} ${req.path}`);
    return handler(req, res).then(data => res.status(200).send(data)).catch(e => {
        console.log(e);
        res.status(500).send(devMode ? e.toString() : 'Internal server error');
    })
};

router.get('/api/v1/volunteers/me', handleSparkProxy(req => sparkFacade.userDetails(req.token)));

//READ DEPARTMENTS
router.get('/api/v1/departments',
    handleSparkProxy(req =>
        sparkFacade.departments(req.token)));

//READ ROLES
router.get('/api/v1/roles',
    handleSparkProxy(req =>
        sparkFacade.roles(req.token)));

//READ ALL VOLUNTEERINGS - READ
router.get('/api/v1/volunteers', handleSparkProxy(req => sparkFacade.volunteers(req.token)));

//READ ALL VOLUNTEERS IN SPECIFIC DEPARTMENT
router.get('/api/v1/departments/:dId/volunteers',
    handleSparkProxy(req =>
        sparkFacade.volunteersByDepartment(req.token, req.params.dId)));

//POST MULTIPLE VOLUNTEERINGS - CREATE
router.post('/api/v1/departments/:dId/volunteers/', handleSparkProxy(req =>
    sparkFacade.addVolunteers(req.token, req.params.dId, req.body.emails.map(email => ({
        email,
        role_id: req.body.role,
        is_production: req.body.is_production
    })))));

//PUT SINGLE VOLUNTEERING - UPDATE
router.put('/api/v1/departments/:dId/volunteers/:uid',
    handleSparkProxy(req =>
        sparkFacade.updateVolunteer(req.token, req.params.dId, req.params.uid, _.pick(req.body, ['role_id', 'is_production']))));

//DELETE SINGLUE VOLUNTEERING - REMOVE
router.delete('/api/v1/departments/:dId/volunteers/:uid',
    handleSparkProxy(req =>
        sparkFacade.deleteVolunteer(req.token, req.params.dId, req.params.uid)));


module.exports = router;
