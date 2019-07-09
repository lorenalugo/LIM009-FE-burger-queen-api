const { ObjectId } = require('mongodb').ObjectId;
const db = require('../libs/connection');
const productModel = require('../model/product-model');

module.exports = {
  getProducts: (req, resp, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);
    const skipValue = page * limit - limit;
    db().then((db) => {
      db.collection('products')
        .find({}, { limit, skip: skipValue || 0 })
        .toArray()
        .then((products) => {
          db.collection('products').count()
            .then((count) => {
              const nextObj = `?limit=${limit || count}&page=${(page)}`;
              const lastObj = `?limit=${limit || count}&page=${Math.ceil(count / limit)}`;
              resp.set('link', `<${nextObj}>; rel="next", <${lastObj}>; rel="last"`);
              resp.json(products);
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
      const product = await (await db()).collection('products').findOne({ _id: new ObjectId(id) });
      if (!product) {
        return next(404);
      }
      resp.send(product);
      return next();
    } catch (e) {
      return next(404);
    }
  },

  createProduct: (req, resp, next) => {
    const {
      name, price, image, type,
    } = req.body;
    if (!name || !price) {
      return next(400);
    }
    return db().then((db) => {
      db.collection('products').insertOne({
        name, price: parseInt(price), image, type,
      })
        .then((product) => {
          resp.send(product.ops[0]);
          next();
        });
    });
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
        next(400);
      } else {
        const product = await (await db()).collection('products').findOneAndUpdate({ _id: new ObjectId(id) }, {
          $set: obj,
        }, { returnNewDocument: true });
        if (product) {
        // console.error('--------product-------', product)
          const updatedProduct = await (await db()).collection('products').findOne({ _id: new ObjectId(id) });
          // console.error('--------product-------', updatedProduct)
          resp.send(updatedProduct);
          next();
        } else {
          next(404);
        }
      }
    } catch (e) {
      next(404);
    }
  },

  deleteProductById: async (req, resp, next) => {
    const id = req.params.productId;
    const product = await (await db()).collection('products').findOne({ _id: id });
    if (product) {
      await (await db).collection('products').deleteOne(product);
      resp.send(product);
      return next();
    }
    return next(404);
  },

};
