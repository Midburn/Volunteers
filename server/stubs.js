const path = require('path');
const fs = require('fs');

function StubServer(app) {
    app.delete('/api/v1/departments/:d/volunteers/:v', function (req, res) {
        console.log(`DELETE ${req.path}`);
        console.log(`parameters: department:${req.params.d}, volunteer:${req.params.v}`);

        console.log(req.path)

    loadVolunteers(function (err, loaded) {
        if (err) {
            console.log(err);
            res.status(404).send('Not found');
        } else {
            let filtered = loaded.filter((volunteer) => !isMatch(volunteer, req.params.d, req.params.v));
            if (filtered.length !== loaded.length) {
                saveVolunteers(filtered, (err) => {
                if (!err) {
                    res.status(200).send('Volunteer disassociated with department');
                } else {
                    res.status(500).send('Internal server error');
                }
                });
            } else {
                res.statusCode = 404;
                res.send('Not found')
            }
        }
    });
    });

    app.get('/api/v1/volunteers/me', function (req, res) {
        console.log(`GET ${req.path}`);
        returnStub('get_volunteer_me', res); //TODO rename stub to get_volunteers_me
    })


    app.put('/api/v1/departments/:d/volunteers/:v', function (req, res) {
    console.log(`PUT ${req.path}`);
    console.log(`EDIT ASSOCIATION path:${req.path}, department:${req.params.d}, volunteer:${req.params.v}`);
    loadVolunteers(function (err, volunteers) {
        let found = false;
        let modifiedVolunteers = volunteers.map((volunteer) => {
        if (isMatch(volunteer, req.params.d, req.params.v)) {
            found = true;
            let modified = volunteer;
            if (req.query.role) {
            modified.role = req.query.role;
            }
            if (req.query.is_production) {
            modified.is_production = req.query.is_production === 'true';
            }
            return modified;
        } else return volunteer;
        });

        if (found) {
        saveVolunteers(modifiedVolunteers,
            (err) => {
            if (!err) {
                res.status(200).send('Volunteer modified');
            } else {
                res.status(500).send('Internal server error');
            }
            });
        } else {
        res.status(400).send('Not Found');
        }
    });
    });


    /////////////////////////////
    // STUBS
    /////////////////////////////

    function isMatch(volunteer, department_id, profile_id) {
    return volunteer.department_id === department_id && volunteer.profile_id === profile_id;
    }

    //the folowwing should be used since in a few cycles associations would be kept apart from the volunteer cache which dependss on the spark service
    function loadAssociations(callback) {
    loadVolunteers(volunteers => callback(volunteers.map(v => _.pick(v, ['profile_id', 'role', 'email', 'is_production', 'department_id']))))
    }

    function loadVolunteers(callback) {
    readJSONFile(path.join(__dirname, '/json_modified/get_volunteer_volunteers.json'),
        function (err, data) {
        if (err) {
            readJSONFile(path.join(__dirname, '/json_stubs/get_volunteer_volunteers.json'), callback);
        } else {
            callback(null, data);
        }
        });
    }

    function saveVolunteers(json, callback) {
    fs.writeFile(path.join(__dirname, '/json_modified/get_volunteer_volunteers.json'),
        JSON.stringify(json),
        callback);
    }

    function returnStub(filename, res) {
        let fullPath = path.join(__dirname, `/json_stubs/${filename}.json`);
        readJSONFile(fullPath, function (err, data) {
            if (err) {
            console.log(err)
            res.status(404).send('Not found');
            } else {
            res.send(data);
            }
            res.end();
        });
    }

    function readJSONFile(filename, callback) {
        fs.readFile(filename, function (err, data) {
            if (err) {
            callback(err);
            return;
            }
            try {
            callback(null, JSON.parse(data));
            } catch (exception) {
            callback(exception);
            }
        });
    }
}

module.exports = {StubServer}