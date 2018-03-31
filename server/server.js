const Mongo = require('./MongoHandler.js');
const DataProcessor = require('./DataProcessor.js');
const RuneScape = require('./runescapeApiRequests.js');
const express = require('express');

const serverURL = 'mongodb://localhost:27017/runescape';

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

                console.log(`GET request for player: ${playerName}`);

                const result = await Mongo.getPlayerData(playerName, conn);
                res.json(result);
            } catch (error) {
                res.status(404);
                res.send('Player does not exists in database.');
            }
        });

        app.put('/api/player/:name', async (req, res) => {
            try {
                const playerName = trimText(req.params.name);

                console.log(`A request to update an entry :: ${playerName}:: has been made`);
                
                const [fromDb, fromHiscores] = await Promise.all(
                    [Mongo.getPlayerData(playerName, conn), RuneScape.lookup(playerName)]
                );

                if (fromDb === null || fromHiscores === null) {
                    res.status(404);
                    console.log('Update was NOT ok!');
                    res.send('Player does not exist in database');
                    return;
                }

                const entry = appendDatapointToExistingPlayerFromDB(fromDb, fromHiscores);

                const result = await Mongo.updatePlayerEntry(playerName, entry, conn);

                res.json(result);
                console.log(`Update was ok!`);
            } catch (error) {
                console.log('Caught error in PUT-handler:', error);
                res.send(error.toString());
            }
        });

        app.post('/api/player/:name', async (req, res) => {
            try {
                const playerName = trimText(req.params.name);
                console.log(`A request to start tracking user :: ${playerName} :: was made.`);

                const fromHiscores = await RuneScape.lookup(playerName);

                if (fromHiscores === null) {
                    res.status(404);
                    console.log('The player does not exist in runescape');
                    res.send('The player does not exist in runescape')
                    return;
                }

                const entry = createNewEntry(playerName, fromHiscores);

                const result = await Mongo.insertNewPlayer(playerName, entry, conn);

                res.send(result);
                console.log('Request was ok!');
            } catch (error) {
                res.status(404);
                console.log('OOPSIEE');
                res.send('Player already exist in database.')
            }
        });

        app.get('/api/player-progress/:name', async (req, res) => {
            try {
                const playerName = trimText(req.params.name);
                const period = req.query.period;
                console.log(`GET request for the progress of player :: ${playerName} ::`);

                const result = await Mongo.getPlayerData(playerName, conn);

                if (result === null) throw new Error('Ooopsie, that player is not tracked!');

                const processed = DataProcessor.process(result, period);
                res.json(processed);
            } catch (error) {
                res.status(404);
                res.send(error.toString());
            }
        });

        app.listen(port, () => {
            console.log(`:: This server is now listening on port ${port} ::`);
        });
    }, err => {
        console.log('Could not connect to server :(');
        process.exit();
    });

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
    console.log(datapoints);
    const datapoint = { date: now, skills: datapointSkills };
    datapoints.push(datapoint);
    return datapoints;
}