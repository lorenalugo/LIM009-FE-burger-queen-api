const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');

let db;

module.exports = () => {
  if (!db) {
    const mongoServer = new MongoMemoryServer();
    return mongoServer.getConnectionString()
      .then(mongoUrl => MongoClient.connect(mongoUrl, { useNewUrlParser: true }))
      .then((client) => {
        mongoServer.getDbName()
          .then((dbName) => {
            db = client.db(dbName);
            return db;
          });
      });
  }
  return Promise.resolve(db);
};
