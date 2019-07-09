const { ObjectId } = require('mongodb').ObjectId;
const db = require('../libs/connection');

module.exports = {
  getOrders: async (req, resp, next) => {
    const { page, limit } = req.query;
    const skipValue = parseInt(page) * parseInt(limit) - parseInt(limit);
    const orders = await (await db()).collection('orders').find({}, {skip: skipValue, limit: parseInt(limit)});
    if (orders) {
      resp.send(orders);
      return next();
    } else {
      return next(404);
    }
  },

  getOrderById: async (req, resp, next) => {
    const id = req.params.orderId;
    const order = await (await db()).collection('orders').findOne({ _id: new ObjectId(id) });
    if (!order) { 
      return next(404); 
    } else {
      resp.send(order);
      return next();
    }
  },

  createOrder: async (req, resp, next) => {
    const { userId, client, products } = req.body;
    const totalProductsOrdered = [];
    if (!userId || !products) {
      return next(400);
    }
    products.forEach((product) => {
      // ids converted into objectId
      const id = new ObjectId(product._id);
      product._id = id;
     // const productFound = await (await db()).collection('products').findOne({ _id: new ObjectId(id) });
     // if (productFound) {totalProductsOrdered.push(product)}
    });

    const order = await(await db()).collection('orders').insertOne({
        userId, client, products, status: 'pending', dateEntry: new Date(),
      });
    resp.send(order);
    return next();
  },

  updateOrderById: (req, resp, next) => {
    const {
      userId, client, products, status,
    } = req.body;
    const dateProcessed = new Date();
    // if new status is delivered, add dateProcessed
    const deliveredOrder = {
      userId, client, products, status, dateProcessed,
    };
    // for other order status, object doesn't have dateprocessed property
    const otherStatusOrder = {
      userId, client, products, status,
    };
    const totalProductsOrdered = [];

    products.forEach((product) => {
      // ids converted into objectId
      const id = new ObjectId(product._id);
      product._id = id;
      db()
        .then(db => db.collection('products').findOne({ _id: id }))
        .then(product => totalProductsOrdered.push(product));
    });

    if (!products) {
      return next(400);
    }
    return db()
      .then(db => db.collection('orders').findOne({
        userId, client, products, status,
      }))
      .then(order => db.collection('orders').findOneAndUpdate({ _id: order._id }, (order.status === 'pending' && status === 'delivered' ? deliveredOrder : otherStatusOrder)))
      .then((result) => {
        resp.send(result);
        next();
      });
  },

  deleteOrderById: async (req, resp, next) => {
    const id = req.params.orderId;
    const order = await (await db()).collection('orders').findOne({'_id': new ObjectId(id) })
    if (!order) {
      return next(404)
    } else {
      await (await db()).collection('orders').deleteOne(order);
      resp.send(order);
      return next();
    }
  },

};
