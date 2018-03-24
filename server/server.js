const Mongo = require('./MongoHandler.js');
const DataProcessor = require('./DataProcessor.js');
const express = require('express');

const app = express();
const port = 5000;

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


app.get('/api/test/:name', (req, res) => {
    console.log(req.params);
    console.log(req.query);

    playerName = req.params.name.replace(/\s/g, '_');

    query(playerName, req.query.period)
        .then(result => {
            console.log('The query was resolved');
            res.json(result);
        })
        .catch(rejection => {
            console.log('The query was rejected');
            res.status(404);
            res.send(rejection);
        });
});

app.get('/api/dbtest/:pname', (req, res) => {
    console.log('Le request');

    console.log(req.params.pname);
});

app.listen(port, () => console.log(`:: This server is now listening on port ${port} ::`));

const query = function queryDataBaseForPlayer(name, period) {
    return new Promise((resolve, reject) => {
        Mongo.open()
            .then(db => {
                Mongo.find(db, {name})
                    .then(data => {
                        DataProcessor.process(data[0].datapoints, period)
                            .then(result => {
                                resolve(result);
                            })
                            .catch(error => {
                                reject(error);
                                return;
                            });
                    })
                    .catch(error => {
                        reject(error);
                        return;
                    });
            })
            .catch(error => {
                reject(error);
                return;
            })
    });
}