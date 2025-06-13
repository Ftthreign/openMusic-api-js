const { nanoid } = require("nanoid");
const bcrypt = require("bcrypt");
const PostgresdbService = require("./PostgresdbService");
const {
  InvariantError,
  AuthenticationError,
  ClientError,
} = require("../../utils");

class UsersService extends PostgresdbService {
  constructor() {
    super();
  }

  async addUser({ username, password, fullname }) {
    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    await this.verifyUsername(username);

    const query = {
      text: `INSERT INTO users (id, username, password, fullname, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      values: [id, username, hashedPassword, fullname, createdAt, updatedAt],
    };

    const res = await this.query(query.text, query.values);

    if (!res.rows[0].id) throw new InvariantError("User gagal ditambahkan");

    return res.rows[0].id;
  }

  async verifyUsername(username) {
    const query = {
      text: "SELECT username FROM users WHERE username = $1",
      values: [username],
    };

    const res = await this.query(query.text, query.values);

    if (res.rows.length > 0)
      throw new InvariantError(
        "Gagal menambahkan user. Username sudah digunakan"
      );
  }

  async verifyUserCredential(username, password) {
    const query = {
      text: "SELECT id, password FROM users WHERE username = $1",
      values: [username],
    };

    const res = await this.query(query.text, query.values);

    if (!res.rows.length)
      throw new AuthenticationError("Kredensial yang anda berikan salah");

    const { id: userId, password: hashedPassword } = res.rows[0];

    const matchPassword = await bcrypt.compare(password, hashedPassword);

    if (!matchPassword)
      throw new AuthenticationError("Kredensial yang anda berikan salah");

    return userId;
  }

  async getUserById(id) {
    const query = {
      text: "SELECT id, username, fullname FROM users WHERE id = $1",
      values: [id],
    };

    const res = await this.query(query.text, query.values);

    if (!res.rows.length) throw new ClientError("User tidak ditemukan", 404);

    return res.rows[0];
  }
}

module.exports = UsersService;
