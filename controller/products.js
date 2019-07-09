const { ObjectId } = require('mongodb').ObjectId;
const db = require('../libs/connection');

module.exports = {
  getProducts: (req, resp, next) => {
    const {
      page,
      limit,
    } = req.query;
    const skipValue = parseInt(page) * parseInt(limit) - parseInt(limit);
    return db().then((db) => {
      db.collection('products').find({} ,{limit:parseInt(limit), skip: skipValue})
        .toArray()
        .then((products) => {
        resp.send(products);
        return next()
      });
    });
  },

  getProductById: async (req, resp, next) => {
    try {
      const id = req.params.productId;
    //console.error('product id!!!!!!', `------${id}------`, id.length, typeof id)
    // ESCRIBIR TRY/CATCH DEVOLVIENDO EL ERROR CON 404
    //(/.*24 hex.*/).match(err.message)
      const product = await (await db()).collection('products').findOne({'_id': new ObjectId(id) });
        if (!product) { 
          return next(404); 
        } else {
          resp.send(product);
          return next();
        }
    } catch {
      return next(404)
    }
  },

  createProduct: (req, resp, next) => {
    const {
      name, price, image, type,
    } = req.body;
   if (!name || !price) {
      return next(400);
    } else {
      return db().then((db) => {
        db.collection('products').insertOne({name, price: parseInt(price), image, type})
        .then((product) => {
          resp.send(product);
          next()
        });
      });
    }
  },
// mejorar el proceso de actualizacion, colocar condicionales por si no se actualizan todos los campos
// MongoError: the update operation document must contain atomic operators.

  updateProductById: async (req, resp, next) => {
    try {
      const id = req.params.productId;
      const {
        name, price, image, type,
      } = req.body;
      if (!name && !price && !image && !type) {
        return next(400);
      } else {
      const product = await (await db()).collection('products').findOneAndUpdate({'_id': new ObjectId(id) }, {$set: {name, price, image, type}});
        if (product) {
          resp.send(product);
          next();
        }
      }
    }
    catch {
      return next(404);
    }
  },

  deleteProductById: async (req, resp, next) => {
    const id = req.params.productId;
    const product = await (await db()).collection('products').findOne({'_id': id })
    if (product) {
      await (await db).collection('products').deleteOne(result)
      resp.send(product);
      return next();
    } else {
      return next(404);
    }
  },

};
