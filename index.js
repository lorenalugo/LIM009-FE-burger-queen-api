const express = require('express');
const cors = require('cors');
const config = require('./config');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/error');
const routes = require('./routes');
const pkg = require('./package.json');

const { port, secret, permision } = config;
const app = express();
const db = require('./libs/connection');

// Conexión a la BD en mongodb

db()
  .then(() => {
    // db.collection('users').createIndex({ email: 1 }, { unique: true });
    app.set('config', config);
    app.set('pkg', pkg);

    // parse application/x-www-form-urlencoded
    app.use(cors(
      permision.application.cors.server,
    ));
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(authMiddleware(secret));

    // Registrar rutas
    routes(app, (err) => {
      if (err) {
        throw err;
      }
    });
    app.use(errorHandler);

    app.listen(port, () => {
      console.info(`App listening on port ${port}`);
    });
  });
