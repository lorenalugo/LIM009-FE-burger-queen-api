const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb://localhost:27017/';

let db;

module.exports = () => {
  if(!db) {
    return MongoClient.connect(uri, { useNewUrlParser: true })
    .then((client) => {
      db = client.db('burger-queen-api');
      return db;
    });
  } else {
  	return Promise.resolve(db)
  }
}
