const { MongoClient } = require('mongodb');
// eslint-disable-next-line import/no-extraneous-dependencies
const { MongoMemoryServer } = require('mongodb-memory-server');

let db;

module.exports = async () => {
  if (!db) {
    const mongoServer = new MongoMemoryServer();
    try {
      const mongoUrl = await mongoServer.getConnectionString();
      const client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true });
      mongoServer.getDbName()
        .then((dbName) => {
          db = client.db(dbName);
          return db;
        });
    } catch (err) {
      return err(err);
    }
  }
  return Promise.resolve(db);
};
