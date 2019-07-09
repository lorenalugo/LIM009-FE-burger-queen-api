const { ObjectId } = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
const db = require('../libs/connection');

module.exports = {
  getUsers: (req, resp, next) => {
    let page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);
    const skipValue = page * limit - limit;
    db().then((db) => {
      db.collection('users')
      .find({} ,{limit, skip: skipValue || 0})
      .toArray()
      .then((users) => {
        db.collection('users').count()
        .then((count) => {
          const nextObj = `?limit=${limit || count}&page=${(page)}`;
          const lastObj = `?limit=${limit || count}&page=${Math.ceil(count / limit)}`;
          resp.set('link', `<${nextObj}>; rel="next", <${lastObj}>; rel="last"`);
          resp.json(users);
          return next();
        });
      });
    });
  },

  getUserById: async (req, resp, next) => {
    const idOrEmail = req.params.uid;
    let oid = null;
    try {
      oid = new ObjectId(idOrEmail)
    } catch (e) {
      // es email
    }

    const user = await (await db()).collection('users').findOne({
      $or: [
        { _id: oid },
        { email: idOrEmail }
      ]
    });
    if (!user) { 
      return next(404); 
    } else {
      resp.json(user);
      return next();
    }
  },

  createUser: async (req, resp, next) => {
    const { email, password, roles } = req.body;
    if (!email || !password) {
      return next(400);
    } else {
      const user = await (await db()).collection('users').insertOne({email, password: bcrypt.hashSync(password, 10), roles: roles || { admin: false }});
      if (user) {
        resp.send({ _id: user.ops[0]._id, email: user.ops[0].email, roles: user.ops[0].roles});
        next();
      }
    }
  },

  updateUserById: async (req, resp, next) => {
    const { email, password, roles } = req.body;
    const idOrEmail = req.params.uid;
    let oid = null;
    try {
      oid = new ObjectId(idOrEmail)
    } catch (e) {
      // es email
    }
    const user = await (await db()).collection('users').findOne({
      $or: [
        { _id: oid },
        { email: idOrEmail }
      ]
    });
    if(!user) {
      return next(404);
    } else if (!email && !password && !roles) {
      return next(400);
    } else if (!req.header.user.roles.admin && roles && roles.admin) {
      return next(403);
    } else {
      const updatedUser = await (await db()).collection('users').findOneAndUpdate({ _id: user._id }, {$set: { email, password: bcrypt.hashSync(password, 10), roles: { admin: false }} }, { returnNewDocument: true });
      resp.json(updatedUser);
      return next();
    }
    
  },

  deleteUserById: async (req, resp, next) => {
    const idOrEmail = req.params.uid;
    let oid = null;
    try {
      oid = new ObjectId(idOrEmail)
    } catch (e) {
      // es email
    }
    const user = await (await db()).collection('users').findOne({
      $or: [
        { _id: oid },
        { email: idOrEmail }
      ]
    });
    if (user) {
      await (await db()).collection('users').deleteOne(user);
      resp.json(user);
      next();
    } else {
      next(404);
    }
  },
};
