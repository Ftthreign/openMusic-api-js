const PostgresdbService = require("./PostgresdbService");
const { InvariantError } = require("../../utils");

class AuthenticationsService extends PostgresdbService {
  constructor() {
    super();
  }

  async addRefreshToken(token) {
    const query = {
      text: "INSERT INTO authentications VALUES($1)",
      values: [token],
    };

    await this.query(query.text, query.values);
  }

  async verifyRefreshToken(token) {
    const query = {
      text: "SELECT tokens FROM authentications WHERE tokens = $1",
      values: [token],
    };

    const res = await this.query(query.text, query.values);

    if (!res.rows.length) throw new InvariantError("Refresh token tidak valid");
    console.log("Verifying token:", token);
    console.log("DB result:", res.rows);
  }

  async deleteRefreshToken(token) {
    const query = {
      text: "DELETE FROM authentications WHERE tokens = $1",
      values: [token],
    };

    await this.query(query.text, query.values);
  }
}

module.exports = AuthenticationsService;
