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
      //console.error('------order-----', order)
      // no se esta trayendo el arreglo de objetos de los products, lo deja como un array vacio
      resp.send(order); 
      return next();
    } catch (e) {
      resp.sendStatus(404);
    }
  },

  createOrder: async (req, resp, next) => {
    const { userId, client, products } = req.body;
    const totalProductsOrdered = [];

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
    
    resp.send(order.ops[0]);
    return next();
  },

  updateOrderById: async (req, resp, next) => {
    //400 cuando no hay propiedad valida: products o status
    //404 cuando orderid no existe
    try {
      const id = req.params.orderid;
      const oid = new ObjectId(id);
      //body params validation
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
        }
      }
      if (products && (Array.isArray(products) === true)) {
        let = totalProducts;
        products.forEach(async (item) => {
          // ids converted into objectId
          const productId = new ObjectId(item.product._id);
          const productFound = await (await db()).collection('products').findOne({ _id: productId });
          if (productFound) {
            productFound.qty = item.qty;
            totalProducts.push(productFound)
          }
        });
        obj.product = totalProducts;
      }
      // console.error('objectkeys--------', Object.keys(obj).length)
      if (Object.keys(obj).length === 0) {
        return resp.sendStatus(400);
      } else {
        const order = await (await db()).collection('orders').findOne({
          _id: oid
        });
        if(order) {
          if (order.status === 'pending' && status === 'delivered') {
            obj.dateProcessed = new Date();
          }
          await (await db()).collection('orders').updateOne({ _id: oid }, {$set: obj});
          const updatedOrder = await (await db()).collection('orders').findOne({
            _id: oid
          });
          resp.send(updatedOrder);
          return next();
        } else {
          return resp.sendStatus(404);
        }
      }
    } catch(err) {
      resp.sendStatus(404);
    }
  },

  deleteOrderById: async (req, resp, next) => {
    try {
      const id = req.params.orderid;
      const oid = new ObjectId(id);
      const order = await (await db()).collection('orders').findOne({ _id: oid });
      await (await db()).collection('orders').deleteOne(order);
      resp.send(order);
      return next();
    } catch(err) {
      return resp.sendStatus(404)
    }
},

};

/*
*

    const id = req.params.orderid;
    let oid = null;
    try {
      oid = new ObjectId(id);
    } catch(err) {
      resp.sendStatus(404);
    }
      //body params validation
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
        }
      }
      if (products && (Array.isArray(products) === true)) {
        let = totalProducts;
        products.forEach(async (item) => {
          // ids converted into objectId
          const productId = new ObjectId(item.product._id);
          const productFound = await (await db()).collection('products').findOne({ _id: productId });
          if (productFound) {
            productFound.qty = item.qty;
            totalProducts.push(productFound)
          }
        });
        obj.product = totalProducts;
      }
console.error('objectkeys--------', Object.keys(obj).length)
      if (Object.keys(obj).length !== 0) {
        const order = await (await db()).collection('orders').findOne({
          _id: oid
        });
        if(order) {
        //console.error('---ADENTRO DEL CONDICIONAL--')
          if (order.status === 'pending' && status === 'delivered') {
            obj.dateProcessed = new Date();
          }
          await (await db()).collection('orders').updateOne({ _id: oid }, {$set: obj});
          const updatedOrder = await (await db()).collection('orders').findOne({
            _id: oid
          });
          resp.send(updatedOrder);
          return next();
        }
      } else {
        resp.sendStatus(400);
      }
*
*/
