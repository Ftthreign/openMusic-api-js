const { Pool } = require("pg");

class PostgresdbService {
  constructor() {
    this._pool = new Pool();
  }

  async query(queryString, values = []) {
    try {
      const res = await this._pool.query(queryString, values);
      return res;
    } catch (e) {
      console.error("DB Query error", e);
      throw e;
    }
  }
}

module.exports = PostgresdbService;
