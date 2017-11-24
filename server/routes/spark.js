const express = require('express');
const router = express.Router();
const SparkFacade = require('../spark/spark');

const devMode = (process.env.ENVIRONMENT === 'debug');
const SPARK_HOST = (process.env.LOCAL_SPARK !== 'true') ? process.env.SPARK_HOST : 'http://localhost:3000';

const sparkFacade = new SparkFacade(SPARK_HOST);

const handleSparkProxy = handler => (req, res) => {
    console.log(`${req.method.toUpperCase()} ${req.path}`);
    return handler(req, res)
        .then(data => res.status(200).send(data))
        .catch(e => {
            console.log(e);
            res.status(500).send(devMode ? e.toString() : 'Internal server error');
        })
};

// GET VOLUNTEER
router.get('/users', handleSparkProxy(req =>
    sparkFacade.getUserDetailByMails(req.token, req.body.emails)));

// GET ALL EVENTS
router.get('/events', handleSparkProxy(req =>
    sparkFacade.getAllEvents(req.token)));

module.exports = router;
