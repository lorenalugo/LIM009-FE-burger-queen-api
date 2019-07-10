const { ObjectId } = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
const db = require('../libs/connection');

module.exports = {
  getUsers: (req, resp, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);
    const skipValue = page * limit - limit;

    db().then((db) => {
      db.collection('users')
        .find({}, { limit, skip: skipValue || 0 })
        .toArray()
        .then((users) => {
          db.collection('users').count()
            .then((count) => {
              const totalPages = Math.ceil(count / limit) || 1;
              const nextObj = `/users?limit=${limit || count}&page=${(page + 1) >= totalPages ? totalPages : (page + 1)}`;
              const lastObj = `/users?limit=${limit || count}&page=${totalPages}`;
              const firstObj = `/users?limit=${limit || count}&page=${page > 1 ? 1 : page}`;
              const prevObj = `/users?limit=${limit || count}&page=${(page - 1) !== 0 ? page - 1 : page}`;
              resp.set('link', `<${firstObj}>; rel="first", <${prevObj}>; rel="prev", <${nextObj}>; rel="next", <${lastObj}>; rel="last"`);
              resp.send(users);
              return next();
            });
        });
    });
  },

  getUserById: async (req, resp, next) => {
    const idOrEmail = req.params.uid;
    let oid = null;
    try {
      oid = new ObjectId(idOrEmail);
    } catch (e) {
      // es email
    }

    const user = await (await db()).collection('users').findOne({
      $or: [
        { _id: oid },
        { email: idOrEmail },
      ],
    });
    if (!user) {
      return next(404);
    }
    resp.send({
      _id: user._id,
      email: user.email,
      roles: user.roles,
    });
    return next();
  },

  createUser: async (req, resp, next) => {
    const { email, password, roles } = req.body;
    if (!email || !password) {
      return next(400);
    }
    try {
      const user = await (await db()).collection('users').insertOne({ email, password: bcrypt.hashSync(password, 10), roles: roles || { admin: false } });
      if (user) {
        resp.send({
          _id: user.ops[0]._id,
          email: user.ops[0].email,
          roles: user.ops[0].roles,
        });
        next();
      }
    } catch (err) {
      next(403);
    }
  },

  updateUserById: async (req, resp, next) => {
    const { email, password, roles } = req.body;
    const idOrEmail = req.params.uid;
    let oid = null;
    try {
      oid = new ObjectId(idOrEmail);
    } catch (e) {
      // es email
    }
    const user = await (await db()).collection('users').findOne({
      $or: [
        { _id: oid },
        { email: idOrEmail },
      ],
    });
    if (!user) {
      return next(404);
    } if (!email && !password && !roles) {
      return next(400);
    } if (!req.header.user.roles.admin && roles && roles.admin) {
      return next(403);
    }
    await (await db()).collection('users').updateOne({ _id: user._id }, { $set: { email: email || user.email, password: bcrypt.hashSync(password, 10), roles: roles || user.roles } });
    const updatedUser = await (await db()).collection('users').findOne({ _id: user._id });
    resp.send({
      _id: updatedUser._id,
      email: updatedUser.email,
      roles: updatedUser.roles,
    });
    return next();
  },

  deleteUserById: async (req, resp, next) => {
    const idOrEmail = req.params.uid;
    let oid = null;
    try {
      oid = new ObjectId(idOrEmail);
    } catch (e) {
      // es email
    }
    const user = await (await db()).collection('users').findOne({
      $or: [
        { _id: oid },
        { email: idOrEmail },
      ],
    });
    if (user) {
      await (await db()).collection('users').deleteOne(user);
      resp.send({
        _id: user._id,
        email: user.email,
        roles: user.roles,
      });
      next();
    } else {
      next(404);
    }
  },
};
