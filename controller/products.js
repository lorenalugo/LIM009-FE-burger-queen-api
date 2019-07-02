const db = require('../libs/connection');
const { ObjectId } = require('mongodb').ObjectId;

module.exports = {
  getProducts: (req, resp, next) => {
    const page = req.query.page;
    const limit = req.query.limit;
    return db().then((db) => {
      db.collection('products').find({}).skip((page*limit)-limit).limit(limit)
        .toArray()
        .then((products) => {
      	resp.send(products);
        next(200)
      });
    });
  },

  getProductById: (req, resp, next) => {
  	const id = req.params.productId;
    return db().then((db) => {
      db.collection('products').findOne({'_id': new ObjectId(id) })
      .then((product) => {
      	resp.send(product);
        next(200)
      });
    });
  
  },
  
  createProduct: (req, resp, next) => {
    const {	name, price, image, type } = req.body;
    if (!name || !price) {
      return next(400);
    } else {
     return db().then((db) => {
        db.collection('products').insert({name, price, image, type})
        .then((product) => {
      	  resp.send(product);
          next(200)
        });
      });
    }
  },

  updateProductById: (req, resp, next) => {
  	const id = req.params.productId;
  	const {	name, price, image, type } = req.body;
  	if (!name && !price && !image && !type) {
      return next(400);
    } else {
      return db().then((db) => {
        db.collection('products').findOneAndUpdate({'_id': new ObjectId(id) }, {name, price, image, type})
        .then((product) => {
      	  resp.send(product);
          next(200)
        });
      });
    }
  },

  deleteProductById: (req, resp, next) => {
  	const id = req.params.productId;
    return db().then((db) => {
      db.collection('products').deleteOne({'_id': new ObjectId(id) })
      .then((result) => {
      	resp.send(result);
        next(200)
      });
    });
  },

}

