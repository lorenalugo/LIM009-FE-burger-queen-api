const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
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
  app.post('/auth', async (req, resp, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(400);
      }
      const user = await (await db()).collection('users').findOne({ email });
      if (await bcrypt.compare(password, user.password)) {
        resp.send({ token: jwt.sign({ id: user._id }, secret) });
        next();
      } else {
        next(401);
      }
    } catch (err) {
      next(404);
    }
  });
  return nextMain();
};

/* const { email, password } = req.body;

    if (!email || !password) {
      return resp.sendStatus(400);
    }
    db()
      .then(db => (
        db.collection('users').findOne({ email })
      ))
      .then((user) => {
        if (!user) {
          resp.sendStatus(404);
        } else if (bcrypt.compare(password, user.password)) {
          resp.sendStatus(401);
        } else {
          resp.send({ token: jwt.sign({ id: user._id }, secret) });
          resp.sendStatus();
        }
      });
*/
