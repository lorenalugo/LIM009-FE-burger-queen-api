const { MongoClient } = require('mongodb');
const config = require('../config');

const { dbUrl } = config;

let db;

module.exports = () => {
  console.error('connection original')
  if (!db) {
    return MongoClient.connect(dbUrl, { useNewUrlParser: true })
      .then((client) => {
        db = client;
        return db;
      });
  }
  return Promise.resolve(db);
};
