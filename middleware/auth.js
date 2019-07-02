const jwt = require('jsonwebtoken');
const secret = require('../config');
const db = require('../libs/connection');
const { ObjectId } = require('mongodb').ObjectId;

module.exports = secret => (req, resp, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return next();
  }

  const [type, token] = authorization.split(' ');

  if (type.toLowerCase() !== 'bearer') {
    return next();
  }

  return jwt.verify(token, secret, (err, decodedToken) => {
    if (err) {
      return next(403);
    }
    // TODO: Verificar identidad del usuario usando `decodeToken.uid`
    
    const id = decodedToken.id
    const user = db().then((db) => db.collection('users').findOne({ _id: new ObjectId(id)}))
                      .then(user);
    req.header.user = user
    return next();
    
  });
};


module.exports.isAuthenticated = req => (
  // TODO: decidir por la informacion del request si la usuaria esta autenticada
  req.header.user && req.header.user.id
);


module.exports.isAdmin = req => {
  // TODO: decidir por la informacion del request si la usuaria es admin
  const adminId = db().then((db) => {db.collection('users').findOne({roles: { admin: true }})
  .then((user) => user._id)});
  return req.header.user.id === adminId;
};


module.exports.requireAuth = (req, resp, next) => (
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : next()
);


module.exports.requireAdmin = (req, resp, next) => (
  // eslint-disable-next-line no-nested-ternary
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : (!module.exports.isAdmin(req))
      ? next(403)
      : next()
);
