const { Pool } = require("pg");
const { config } = require("../../utils");

class PostgresdbService {
  constructor() {
    this._pool = new Pool(config.postgres);
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
