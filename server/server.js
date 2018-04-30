const Mongo = require('./MongoHandler.js');
const ProgressCalculator = require('./ProgressCalculator.js');
const RuneScape = require('./runescapeApiRequests.js');
const express = require('express');

const serverURL = 'mongodb://localhost:27017/deleteme';

const app = express();
const port = 5000;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});


Mongo.connect(serverURL)
    .then(conn => {

        app.get('/api/player/:name', async (req, res) => {
            try {
                const playerName = trimText(req.params.name);

                const query = req.query;
                const now = new Date();

                const result = await Mongo.getPlayerData(playerName, conn);

                if (result === null) {
                    const msg = createResponseMessage('Player was not found in database.');
                    res.status(400);
                    res.json(msg);
                    return;
                }

                if (query.period === undefined) {
                    // Send plain entry for this player
                    const msg = createResponseMessage('OK', result);
                    res.json(msg);
                    return;

                } else if (isNaN(query.period)) {
                    const msg = createResponseMessage('Unrecognized token in period.');
                    res.status(400);
                    res.json(msg);
                } else {

                    const dpLength = ProgressCalculator.getNumberOfDatapointsWithinPeriod(result, query.period, now);

                    if (dpLength === 0) {
                        const msg = createResponseMessage('The player does not have enough datapoints within this period.');
                        res.status(200);
                        res.json(msg);
                        return;
                    }

                    if (dpLength === 1) {
                        const progress = ProgressCalculator.calculateProgress(result, query.period);
                        const msg = createResponseMessage('The player only have one datapoint within this period.', progress);
                        res.status(200);
                        res.json(msg);
                        return;
                    }

                    const progress = ProgressCalculator.calculateProgress(result, query.period);
                    const msg = createResponseMessage('OK', progress);
                    res.json(msg);
                    return;

                }
            } catch (error) {
                console.log(error);
                res.status(500);
                const msg = createResponseMessage('Server error');
                res.json(msg);
            }
        });

        app.post('/api/player/:name', async (req, res) => {
            try {
                const playerName = trimText(req.params.name);

                const [fromDb, fromHiscores] = await Promise.all(
                    [Mongo.getPlayerData(playerName, conn), RuneScape.lookup(playerName)]
                );

                if (fromHiscores === null) {
                    const msg = createResponseMessage('Player does not exist.');
                    res.status(404);
                    res.json(msg);
                    return;
                }

                if (fromDb === null) {
                    // Player not exist, make a new.
                    const entry = createNewEntry(playerName, fromHiscores);
                    const result = await Mongo.insertNewPlayer(playerName, entry, conn);
                    const progress = ProgressCalculator.calculateProgress(entry, 7);

                    const msg = createResponseMessage('Started tracking player: ' + playerName, progress);
                    res.json(msg);
                    return;
                }
                else {
                    // Player exists, append new datapoint.

                    // Reject if last datapoint is less than 1 minute old.
                    if (hasBeenUpdatedLastMinute(fromDb)) {
                        const msg = createResponseMessage('Player has already been updated less than 1 minute ago. Please wait. Dont overload server. It makes server very sad.');
                        res.status(429);
                        res.json(msg);
                        return;
                    }
                    // TODO: CHECK IF PROGRESS IS UNCHANGED SINCE LAST POINT? NO NEED TO CREATE NEW POINT IN THAT CASE? JUST UPDATE DATE ON OLD OR SMTH
                    const appended = appendDatapointToExistingPlayerFromDB(fromDb, fromHiscores);

                    const result = await Mongo.updatePlayerEntry(playerName, appended, conn);

                    const playerData = await Mongo.getPlayerData(playerName, conn); // ???

                    const progress = ProgressCalculator.calculateProgress(playerData, 7);

                    const msg = createResponseMessage('Added 1 datapoint to player: ' + playerName, progress);
                    res.json(msg);
                    return;
                }
            } catch (error) {
                console.log(error);
                const msg = createResponseMessage('Server error.');
                res.status(500);
                res.json(msg);
            }
        });

        app.listen(port, () => {
            console.log(`:: This server is now listening on port ${port} ::`);
        });
    }, err => {
        console.log('Could not connect to server :(');
        process.exit();
    });

const createResponseMessage = (msg, data = {}) => {
    return {
        msg,
        data,
    }
}
const trimText = text => {
    let modified = text.replace(/\s/g, '_');
    modified = modified.toLowerCase();
    return modified;
}

const createNewEntry = (playerName, datapoint) => {
    const now = new Date();
    const entry = { _id: playerName, datapoints: [{ date: now, skills: datapoint }] };
    return entry;
}

const appendDatapointToExistingPlayerFromDB = (playerEntryFromDb, datapointSkills) => {
    const now = new Date();
    const datapoints = playerEntryFromDb.datapoints || [];
    const datapoint = { date: now, skills: datapointSkills };
    datapoints.push(datapoint);
    return datapoints;
}

const hasBeenUpdatedLastMinute = player => {
    const now = new Date();
    const lastDatapoint = player.datapoints[player.datapoints.length - 1];

    return lastDatapoint.date.getTime() > now.getTime() - (60 * 1000);
}