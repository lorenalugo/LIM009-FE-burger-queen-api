const db = require('../libs/connection');
const { ObjectId } = require('mongodb').ObjectId;

module.exports = {
  getOrders: (req, resp, next) => {
    db().then((db) => {
      db.collection('orders').find({} ,{limit:10, sort: [['_id',-1]]})
        .toArray()
        .then((orders) => {
      	resp.send(orders);
        next(200)
      });
    });
  },

  getOrderById: (req, resp, next) => {
  	const id = req.params.orderId;
    db().then((db) => {
      db.collection('orders').findOne({'_id': new ObjectId(id) })
      .then((order) => {
      	resp.send(order);
        next(200)
      });
    });
  
  },
  
  createOrder: (req, resp, next) => {
    const {	userId, products} = req.body;
    if (!userId || !products) {
      return next(400);
    } else {
      db().then((db) => {
        db.collection('orders').insert({userId, products, status: 'pending', dateEntry: new Date()})
        .then((order) => {
      	  resp.send(order);
          next(200)
        });
      });
    }
  },

  updateOrderById: (req, resp, next) => {
  	const id = req.params.orderId;
  	const {	userId, products, status } = req.body;
    let dateProcessed;
    if(status === 'delivered') {
      dateProcessed = new Date();
    }
  	if (!name && !price && !image && !type) {
      return next(400);
    } else {
      db().then((db) => {
        db.collection('orders').findOneAndUpdate({'_id': new ObjectId(id) }, {userId, products, status, dateProcessed})
        .then((order) => {
      	  resp.send(order);
          next(200)
        });
      });
    }
  },

  deleteOrderById: (req, resp, next) => {
  	const id = req.params.orderId;
    db().then((db) => {
      db.collection('orders').deleteOne({'_id': new ObjectId(id) })
      .then((result) => {
      	resp.send(result);
        next(200)
      });
    });
  },

}

