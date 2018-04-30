const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017/deleteme';
const databaseName = 'deleteme';
const collectionName = 'players';


const getPlayerData = (name, conn) => {
    return conn.db(databaseName)
        .collection(collectionName)
        .findOne({ _id: name });
}


const updatePlayerEntry = (name, entry, conn) => {
    return conn.db(databaseName)
        .collection(collectionName)
        .updateOne(
            { _id: name },
            { $set: { datapoints: entry } }, // ????
    );
}

const insertNewPlayer = (name, entry, conn) => {
    return conn.db(databaseName)
        .collection(collectionName)
        .insertOne(entry);
}


const connectToDatabase = url => {
    return MongoClient.connect(url);
}




module.exports.getPlayerData = getPlayerData;
module.exports.connect = connectToDatabase;
module.exports.updatePlayerEntry = updatePlayerEntry;
module.exports.insertNewPlayer = insertNewPlayer;
