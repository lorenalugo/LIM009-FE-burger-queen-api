exports.port = process.argv[2] || process.env.PORT || 8080;
exports.dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/burger-queen-api';
exports.secret = process.env.JWT_SECRET || 'esta-es-la-api-burger-queen';
exports.adminEmail = process.env.ADMIN_EMAIL || 'admin@localhost';
exports.adminPassword = process.env.ADMIN_PASSWORD || 'changeme';
exports.permision = {
  application: {
    cors: {
      server: [
        {
          origin: 'localhost:8080',
          credentials: true,
        },
      ],
    },
  },
};
