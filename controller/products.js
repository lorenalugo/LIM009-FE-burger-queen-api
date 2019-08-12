const { ObjectId } = require('mongodb').ObjectId;
const db = require('../libs/connection');
const pagination = require('./pagination');

module.exports = {
  getProducts: (req, resp, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10);
    const skipValue = page * limit - limit;
    db().then((db) => {
      db.collection('products')
        .find({}, { limit, skip: skipValue || 0 })
        .toArray()
        .then((products) => {
          db.collection('products').count()
            .then((count) => {
              const link = pagination('products', count, page, limit);
              resp.set('link', link.link);
              resp.send(products);
              return next();
            });
        });
    });
  },

  getProductById: async (req, resp, next) => {
    try {
      const id = req.params.productId;
      const idToObjectId = new ObjectId(id);
      // (/.*24 hex.*/).match(err.message)
      const product = await (await db()).collection('products').findOne({ _id: idToObjectId });
      if (!product) {
        throw Error;
      }
      resp.send(product);
      return next();
    } catch (e) {
      return resp.sendStatus(404);
    }
  },

  createProduct: async (req, resp, next) => {
    const {
      name, price, image, type,
    } = req.body;
    if (!name || !price) {
      return resp.sendStatus(400);
    }

    const product = await (await db()).collection('products').insertOne({
      name,
      price: parseInt(price, 10),
      image,
      type,
    });
    resp.send(product.ops[0]);
    return next();
  },

  updateProductById: async (req, resp, next) => {
    try {
      const id = req.params.productId;
      const {
        name, price, image, type,
      } = req.body;
      const obj = {};
      if (name && (typeof (name) === 'string')) {
        obj.name = name;
      }
      if (price && (/\d+/.test(price))) {
        obj.price = price;
      }
      if (image && (typeof (image) === 'string')) {
        obj.image = image;
      }
      if (type && (typeof (type) === 'string')) {
        obj.type = type;
      }
      if (Object.keys(obj).length === 0) {
        resp.sendStatus(400);
      } else {
        const product = await (await db()).collection('products').findOneAndUpdate({ _id: new ObjectId(id) }, {
          $set: obj,
        });
        if (product) {
          const updatedProduct = await (await db()).collection('products').findOne({ _id: new ObjectId(id) });
          resp.send(updatedProduct);
          next();
        }
      }
    } catch (e) {
      resp.sendStatus(404);
    }
  },

  deleteProductById: async (req, resp, next) => {
    try {
      const id = req.params.productId;
      const oid = new ObjectId(id);
      const product = await (await db()).collection('products').findOne({ _id: oid });
      if (product) {
        await (await db()).collection('products').deleteOne({ _id: product._id });
        resp.send(product);
        next();
      }
    } catch (err) {
      resp.sendStatus(404);
    }
  },

};
