const { MongoClient } = require('mongodb');
const config = require('../config');

const { dbUrl } = config;

let db;

module.exports = () => {
  if (!db) {
    return MongoClient.connect(dbUrl, { useNewUrlParser: true })
      .then((client) => {
        db = client.db('burguer-queen-api');
        return db;
      });
  }
  return Promise.resolve(db);
};
