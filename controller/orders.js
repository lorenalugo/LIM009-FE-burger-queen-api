const { ObjectId } = require('mongodb').ObjectId;
const db = require('../libs/connection');
const pagination = require('./pagination');

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
              const link = pagination('orders', count, page, limit);
              resp.set('link', link.link);
              resp.json(orders);
              return next();
            });
        });
    });
  },

  getOrderById: async (req, resp, next) => {
    const id = req.params.orderid;
    let oid = null;
    // console.error('ID-getorder route-------', id);
    try {
      oid = new ObjectId(id);
      const order = await (await db()).collection('orders').aggregate([
        { $match: { _id: oid } },
        { $unwind: '$products' },
        {
          $lookup: {
            from: 'products', localField: 'products.product', foreignField: '_id', as: 'products-aggregate',
          },
        },
        { $unwind: '$products-aggregate' },
        { $addFields: { 'products.product': '$products-aggregate' } },
        { $addFields: { 'products.qty': '$products.qty' } },
        {
          $group: {
            _id: '$_id',
            userId: { $first: '$userId' },
            client: { $first: '$client' },
            products: { $push: '$products' },
            status: { $first: '$status' },
            dateEntry: { $first: '$dateEntry' },
          },
        },
      ]).toArray();
      if (order[0] === undefined) {
        resp.sendStatus(404);
      } else {
        // console.error('-----orderRead---GETORDER---', order[0]);
        resp.send(order[0]);
        return next();
      }
    } catch (e) {
      resp.sendStatus(404);
    }
  },

  createOrder: async (req, resp, next) => {
    const { userId, client, products } = req.body;

    if (!userId || !products) {
      return resp.sendStatus(400);
    }

    const productsOrdered = products.map(async (product) => {
      // ids converted into objectId
      const id = new ObjectId(product.product);
      const productFound = await (await db()).collection('products').findOne({ _id: id });
      return productFound;
    });
    const productsObj = products.map(obj => ({
      product: new ObjectId(obj.product),
      qty: obj.qty,
    }));
    if (productsOrdered.length === products.length) {
      const orderCreated = await (await db()).collection('orders').insertOne({
        userId, client, products: productsObj, status: 'pending', dateEntry: new Date(),
      });
      const orderRead = await (await db()).collection('orders').aggregate([
        { $match: { _id: ObjectId(orderCreated.ops[0]._id) } },
        { $unwind: '$products' },
        {
          $lookup: {
            from: 'products', localField: 'products.product', foreignField: '_id', as: 'products-aggregate',
          },
        },
        { $unwind: '$products-aggregate' },
        { $addFields: { 'products.product': '$products-aggregate' } },
        { $addFields: { 'products.qty': '$products.qty' } },
        {
          $group: {
            _id: '$_id',
            userId: { $first: '$userId' },
            client: { $first: '$client' },
            products: { $push: '$products' },
            status: { $first: '$status' },
            dateEntry: { $first: '$dateEntry' },
          },
        },
      ]).toArray();
      // console.error('-----orderCReated------', orderRead[0]);
      resp.send(orderRead[0]);
      return next();
    }
    return resp.sendStatus(404);
  },

  updateOrderById: async (req, resp, next) => {
    // 400 cuando no hay propiedad valida: products o status
    // 404 cuando orderid no existe
    const id = req.params.orderid;
    let oid = null;
    // console.error('ID-UPDATE ROUTE-------', id);
    try {
      oid = new ObjectId(id);
      // body params validation
      const {
        userId, client, products, status,
      } = req.body;
      const obj = {};

      if (userId && (typeof (userId) === 'string') && userId.length === 24) {
        obj.userId = userId;
      }
      if (client && (typeof (client) === 'string')) {
        obj.client = client;
      }
      if (status && (typeof (status) === 'string')) {
        if (status === 'preparing' || status === 'canceled' || status === 'delivering' || status === 'delivered') {
          obj.status = status;
        } else {
          return resp.sendStatus(400);
        }
      }
      if (products && (Array.isArray(products) === true)) {
        let totalProducts;
        products.forEach(async (item) => {
          // ids converted into objectId
          const productId = new ObjectId(item.product._id);
          const productFound = await (await db()).collection('products').findOne({ _id: productId });
          if (productFound) {
            productFound.qty = item.qty;
            totalProducts.push(productFound);
          }
        });
        obj.product = totalProducts;
      } else if (products && !Array.isArray(products)) {
        return resp.sendStatus(400);
      }
      // console.error('objectkeys--------', Object.keys(obj).length)
      if (Object.keys(obj).length === 0) {
        // console.error('objectkeys--------', Object.keys(obj).length);
        return resp.sendStatus(400);
      }
      const order = await (await db()).collection('orders').findOne({
        _id: oid,
      });
      if (order) {
        if (order.status === 'pending' && status === 'delivered') {
          obj.dateProcessed = new Date();
        }
        await (await db()).collection('orders').updateOne({ _id: oid }, { $set: obj });
        const updatedOrder = await (await db()).collection('orders').aggregate([
          { $match: { _id: oid } },
          { $unwind: '$products' },
          {
            $lookup: {
              from: 'products', localField: 'products.product', foreignField: '_id', as: 'products-aggregate',
            },
          },
          { $unwind: '$products-aggregate' },
          { $addFields: { 'products.product': '$products-aggregate' } },
          { $addFields: { 'products.qty': '$products.qty' } },
          {
            $group: {
              _id: '$_id',
              userId: { $first: '$userId' },
              client: { $first: '$client' },
              products: { $push: '$products' },
              status: { $first: '$status' },
              dateEntry: { $first: '$dateEntry' },
            },
          },
        ]).toArray();
        resp.send(updatedOrder[0]);
        return next();
      }
      return resp.sendStatus(404);
    } catch (err) {
      resp.sendStatus(404);
    }
  },

  deleteOrderById: async (req, resp, next) => {
    try {
      const id = req.params.orderid;
      const oid = new ObjectId(id);
      const order = await (await db()).collection('orders').aggregate([
        { $match: { _id: oid } },
        { $unwind: '$products' },
        {
          $lookup: {
            from: 'products', localField: 'products.product', foreignField: '_id', as: 'products-aggregate',
          },
        },
        { $unwind: '$products-aggregate' },
        { $addFields: { 'products.product': '$products-aggregate' } },
        { $addFields: { 'products.qty': '$products.qty' } },
        {
          $group: {
            _id: '$_id',
            userId: { $first: '$userId' },
            client: { $first: '$client' },
            products: { $push: '$products' },
            status: { $first: '$status' },
            dateEntry: { $first: '$dateEntry' },
          },
        },
      ]).toArray();
      await (await db()).collection('orders').deleteOne({ _id: oid });
      resp.send(order[0]);
      return next();
    } catch (err) {
      return resp.sendStatus(404);
    }
  },

};
