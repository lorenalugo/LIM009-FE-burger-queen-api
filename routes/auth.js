const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../libs/connection');

const { secret } = config;

/** @module auth */
module.exports = (app, nextMain) => {
  /**
   * @name /auth
   * @description Crea token de autenticación.
   * @path {POST} /auth
   * @body {String} email Correo
   * @body {String} password Contraseña
   * @response {String} token Token a usar para los requests sucesivos
   * @code {200} si la autenticación es correcta
   * @code {401} si cabecera de autenticación no está presente
   * @code {400} si no se proveen `email` o `password` o ninguno de los dos
   * @auth No requiere autenticación
   */
  app.post('/auth', (req, resp, next) => {
    const { email, password } = req.body;
    let id = db().then((db) => db.collection('users').findOne({email})
      .then((user) => user._id));
    
    if (!email || !password) {
      return next(400);
    }

    const payload = {
      id: user._id
    };

    return jwt.sign(payload, secret, (err, token) => {
      if (err) return next(err);
      resp.send({token});
      return next(200);
    });

  });

  return nextMain();
};
