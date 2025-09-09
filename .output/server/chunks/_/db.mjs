import { u as useRuntimeConfig } from './nitro.mjs';
import mysql from 'mysql2/promise';

const db = mysql.createPool({
  host: useRuntimeConfig().databaseHost,
  user: useRuntimeConfig().databaseUser,
  password: useRuntimeConfig().databasePassword,
  database: useRuntimeConfig().databaseDatabase,
  charset: useRuntimeConfig().databaseCharset
});

export { db as d };
//# sourceMappingURL=db.mjs.map
