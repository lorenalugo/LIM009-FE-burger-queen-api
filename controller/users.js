const db = require('../libs/connection');
const { ObjectId } = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');

module.exports = {
  getUsers: (req, resp, next) => {
    const page = req.query.page;
    const limit = req.query.limit;
    return db().then((db) => {
      db.collection('users').find({}).skip((page*limit)-limit).limit(limit)
        .toArray()
        .then((users) => {
      	resp.send(users);
        next(200)
      });
    });  
  },

  getUserById: (req, resp, next) => {
  	const id = req.params.productId;
    return db().then((db) => {
      db.collection('users').findOne({'_id': new ObjectId(id) })
      .then((user) => {
      	resp.send(user);
        next(200)
      });
    });
  
  },
  
  createUser: (req, resp, next) => {
    const {	email, password } = req.body;
    if (!email || !password) {
      return next(400);
    } else {
      return db().then((db) => {
        db.collection('users').insert({email, password: bcrypt.hashSync(password, 10), roles: {admin: false}})
        .then((user) => {
      	  resp.send(user);
          next(200)
        });
      });
    }
  },

  updateUserById: (req, resp, next) => {
  	const id = req.params.userId;
  	const {	email, password } = req.body;
  	if (!email && !password) {
      return next(400);
    } else {
      return db().then((db) => {
        db.collection('users').findOneAndUpdate({'_id': new ObjectId(id) }, {email, password: bcrypt.hashSync(password, 10), roles: {admin: false}})
        .then((user) => {
      	  resp.send(user);
          next(200)
        });
      });
    }
  },

  deleteUserById: (req, resp, next) => {
  	const id = req.params.userId;
    return db().then((db) => {
      db.collection('users').deleteOne({'_id': new ObjectId(id) })
      .then((result) => {
      	resp.send(result);
        next(200)
      });
    });
  },
}
