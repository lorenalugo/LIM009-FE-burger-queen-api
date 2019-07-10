const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb').ObjectId;
const db = require('../libs/connection');
// const secret = require('../config');

module.exports = secret => async (req, resp, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    req.header.user = undefined;
    return next();
  }
  const [type, token] = authorization.split(' ');

  if (type.toLowerCase() !== 'bearer') {
    return next();
  }
  const decodedToken = await (new Promise((resolve) => { resolve(jwt.verify(token, secret)); }));
  if (decodedToken) {
    const user = await (await db()).collection('users').findOne({ _id: new ObjectId(decodedToken.id) });
    if (user) {
      Object.assign(req, { header: { token, user } });
      return next();
    }
    return next();
  }
  return next();
};


module.exports.isAuthenticated = req => (
  req.header.user && req.header.user._id
);


module.exports.isAdmin = req => (
  // TODO: decidir por la informacion del request si la usuaria es admin
  req.header.user && req.header.user.roles && req.header.user.roles.admin
);

// isAdminOrItself
module.exports.requireAuth = (req, resp, next) => {
  console.error('requireAuth')
  return (
    (!module.exports.isAuthenticated(req))
      ? next(401)
      : next()
  );
}


module.exports.requireAdmin = (req, resp, next) => {

  console.error('requireADmin ANTESSSS')
  const isAuth = module.exports.isAuthenticated(req)
  console.error('dp isAuth', !isAuth)
  const isAdmin2 = module.exports.isAdmin(req)
  console.error('dp isAdmin2', !isAdmin2)
  try {
    if (!module.exports.isAuthenticated(req)) {
      return next(401);
    } else if (!module.exports.isAdmin(req)) {
      return next(403);
    }
    return next()
  } catch(e) {
    console.error(e)
  }
  return false
}

module.exports.isAdminOrItself = (req, resp, next) => {
  if (!module.exports.isAdmin(req)) {
    if (req.header.user._id === req.params.uid || req.header.user.email === req.params.uid) {
      next();
    } else {
      next(403);
    }
  } else {
    next();
  }
};
