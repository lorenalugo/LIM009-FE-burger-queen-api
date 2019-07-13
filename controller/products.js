const { ObjectId } = require('mongodb').ObjectId;
const db = require('../libs/connection');

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
              const totalPages = Math.ceil(count / limit) || 1;
              const nextObj = `/products?limit=${limit || count}&page=${(page + 1) >= totalPages ? totalPages : (page + 1)}`;
              const lastObj = `/products?limit=${limit || count}&page=${totalPages}`;
              const firstObj = `/products?limit=${limit || count}&page=${page > 1 ? 1 : page}`;
              const prevObj = `/products?limit=${limit || count}&page=${(page - 1) !== 0 ? page - 1 : page}`;
              resp.set('link', `<${firstObj}>; rel="first", <${prevObj}>; rel="prev", <${nextObj}>; rel="next", <${lastObj}>; rel="last"`);
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
      const product = await (await db()).collection('products').findOne({ _id: new ObjectId(id) });
      if (!product) {
        return resp.sendStatus(404);
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
    console.error('+++++PRODUCT name y price++++', name, price)
    if (!name || !price) {
      return resp.sendStatus(400);
    }

    const product = await (await db()).collection('products').insertOne({
      name,
      price,
      image,
      type,
    });
    console.error('+++++PRODUCT CREATED++++', product.ops[0])
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
        // console.error('--------product-------', product)
          const updatedProduct = await (await db()).collection('products').findOne({ _id: new ObjectId(id) });
          // console.error('--------product-------', updatedProduct)
          resp.send(updatedProduct);
          next();
        } else {
          resp.sendStatus(404);
        }
      }
    } catch (e) {
      resp.sendStatus(404);
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
    return resp.sendStatus(404);
  },

};
