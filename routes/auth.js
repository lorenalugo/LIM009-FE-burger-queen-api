const jwt = require('jsonwebtoken');
const config = require('../config');

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
    const id = req.params.userId;

    if (!email || !password) {
      return next(400);
    }

    const payload = {
      email,
      password: bcrypt.hashSync(password, 10),
      roles: { admin: false },
      //sub: id
    };

    return jwt.sign(payload, secret, (err, token) => {
      if (err) return next(err);
      resp.send({token});
      return next(200);
    });

  });

  return nextMain();
};
