const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017';
const databaseName = 'runescape';
const collectionName = 'players';

const verbose = true;

const findDocuments = function(db, query = {}) {
    return new Promise((resolve, reject) => {
        if (verbose) {
            console.log('Attempting to retrieve documents form database');
        }
        const collection = db.collection(collectionName);
        collection.find(query).toArray((err, docs) => {

            if (err) {
                if (verbose) {
                    console.log('Error when retrieving data from collection');
                    reject(err);
                    throw err;
                    return;
                }
            }

            if (!docs.length) {
                if (verbose) {
                    console.log('Query success, but no documents matched the query.');
                }
                reject('The player does not exist in database.');
                return;
            }

            if (verbose) {
                console.log('Found some documents.');
            }
            resolve(docs);
        });
    });
}

const openDatabase = function() {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, (err, client) => {
            if (err) {
                if (verbose) {
                    console.log('There was an error when trying to connect to database.');
                }
                reject(err);
                return;
            }
        
            const db = client.db(databaseName);

            if (verbose) {
                console.log('Connected successfully to server');
            }
            resolve(db);
        });
    });
}
module.exports.find = findDocuments;
module.exports.open = openDatabase;
