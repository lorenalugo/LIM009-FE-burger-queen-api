const { ObjectId } = require('mongodb').ObjectId;
const db = require('../libs/connection');

module.exports = {
  getOrders: (req, resp, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);
    const skipValue = page * limit - limit;
    db().then((db) => {
      db.collection('orders')
        .find({}, { limit, skip: skipValue || 0 })
        .toArray()
        .then((orders) => {
          db.collection('orders').count()
            .then((count) => {
              const nextObj = `?limit=${limit || count}&page=${(page)}`;
              const lastObj = `?limit=${limit || count}&page=${Math.ceil(count / limit)}`;
              resp.set('link', `<${nextObj}>; rel="next", <${lastObj}>; rel="last"`);
              resp.json(orders);
              return next();
            });
        });
    });
  },

  getOrderById: async (req, resp, next) => {
    const id = req.params.orderid;
    let oid = null;
    try {
      oid = new ObjectId(id);
      const order = await (await db()).collection('orders').findOne({ _id: oid });
      if (!order) {
        resp.sendStatus(404);
      }
      console.error('------order-----', order)
      resp.send(order); // no se esta trayendo el arregle de objetos de los products, lo deja como un array vacio
      return next();
    } catch (e) {
      resp.sendStatus(404);
    }
  },

  createOrder: async (req, resp, next) => {
    const { userId, client, products } = req.body;
    const totalProductsOrdered = [];
    console.error('+++++PRODUCT Y USERID++++', products, userId)
    if (!userId || !products) {
      return resp.sendStatus(400);
    }
    products.forEach(async (product) => {
      // ids converted into objectId
      const id = new ObjectId(product.product);
      const productFound = await (await db()).collection('products').findOne({ _id: id });
      productFound.qty = product.qty;
      if (productFound) { totalProductsOrdered.push({product: productFound}) }
    });

    const order = await (await db()).collection('orders').insertOne({
      userId, client, products: totalProductsOrdered, status: 'pending', dateEntry: new Date(),
    });
    console.error('------ order created -----', order.ops[0])
    resp.send(order.ops[0]);
    return next();
  },

  updateOrderById: async (req, resp, next) => {
    try {
      const id = req.params.orderid;
      const oid = new ObjectId(id);
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

      products.forEach(async (product) => {
        // ids converted into objectId
        const productId = new ObjectId(product.product._id);
        const productFound = await (await db()).collection('products').findOne({ _id: productId });
        if (productFound) {totalProductsOrdered.push(productFound)};
      });

      if (!products || status!== 'pending' || status!== 'canceled' || status!== 'delivering' || status!== 'delivered') {
        return resp.sendStatus(400);
      }
      const order = await (await db()).collection('orders').findOne({
        userId, client, products, status,
      });
      if(order) {await (await db()).collection('orders').findOneAndUpdate({ _id: order._id }, (order.status === 'pending' && status === 'delivered' ? deliveredOrder : otherStatusOrder))};
      resp.send(result);
      return next();
    } catch(err) {
      resp.sendStatus(400);
    }
  },

  deleteOrderById: async (req, resp, next) => {
    const id = req.params.orderId;
    const order = await (await db()).collection('orders').findOne({ _id: new ObjectId(id) });
    if (!order) {
      return resp.sendStatus(404);
    }
    await (await db()).collection('orders').deleteOne(order);
    resp.send(order);
    return next();
  },

};
