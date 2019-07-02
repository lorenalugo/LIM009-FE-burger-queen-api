const db = require('../libs/connection');
const { ObjectId } = require('mongodb').ObjectId;

module.exports = {
  getOrders: (req, resp, next) => {
    const page = req.query.page;
    const limit = req.query.limit;
    return db().then((db) => {
      db.collection('orders').find({}).skip((page*limit)-limit).limit(limit)
        .toArray()
        .then((orders) => {
      	resp.send(orders);
        next(200)
      });
    });
  },

  getOrderById: (req, resp, next) => {
  	const id = req.params.orderId;
    return db().then((db) => {
      db.collection('orders').findOne({'_id': new ObjectId(id) })
      .then((order) => {
      	resp.send(order);
        next(200)
      });
    });
  
  },
   
  createOrder: (req, resp, next) => {
    const {	userId, client, products} = req.body;
    let totalProductsOrdered = [];
    if (!userId || !products) {
      return next(400);
    } else {

      products.forEach((product) => {
        // ids converted into objectId
        const id = new ObjectId(product._id);
        product._id = id;  
        db()
        .then((db) => db.collection('products').findOne({_id: id}))
        .then((product) => totalProductsOrdered.push(product))
        .catch(next(404))
      });

      return db().then((db) => {
        db.collection('orders').insert({userId, client, products, status: 'pending', dateEntry: new Date()})
        .then((order) => {
      	  resp.send(order);
          next(200)
        });
      });
    }
  },

  updateOrderById: (req, resp, next) => {
  	const {	userId, client, products, status } = req.body;
    const dateProcessed = new Date();
    // if new status is delivered, add dateProcessed
    const deliveredOrder = {userId, client, products, status, dateProcessed};
    // for other order status, object doesn't have dateprocessed property
  	const otherStatusOrder = {userId, client, products, status};
    const id = new ObjectId(id);

    products.forEach((product) => {
        // ids converted into objectId
        const id = new ObjectId(product._id);
        product._id = id;  
        db()
        .then((db) => db.collection('products').findOne({_id: id}))
        .then((product) => totalProductsOrdered.push(product))
      });

    if (!products) {
      return next(400);
    } else {
      return db()
      .then((db) => db.collection('orders').findOne({'_id': id }))
      .then((order) => 
        db.collection('orders').findOneAndUpdate({'_id': id }, (order.status === 'pending' && status === 'delivered' ? deliveredOrder : otherStatusOrder))
      )
      .then((result) => {
        resp.send(result);
        next(200)
      });
    }
  },

/*
      db().then((db) => {
        db.collection('orders').findOneAndUpdate({'_id': new ObjectId(id) }, {userId, products, status, dateProcessed})
        .then((order) => {
          resp.send(order);
          next(200)
        });
      });
*/

  deleteOrderById: (req, resp, next) => {
  	const id = req.params.orderId;
    return db().then((db) => {
      db.collection('orders').deleteOne({'_id': new ObjectId(id) })
      .then((result) => {
      	resp.send(result);
        next(200)
      });
    });
  },

}

