const { nanoid } = require("nanoid");
const PostgresdbService = require("./PostgresdbService");
const { InvariantError, ClientError } = require("../../utils");

class SongsService extends PostgresdbService {
  constructor() {
    super();
  }

  async addSong({ title, year, genre, performer, duration, albumId }) {
    const id = `song-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: `INSERT INTO songs 
        (id, title, year, genre, performer, duration, album_id, created_at, updated_at)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      values: [
        id,
        title,
        year,
        genre,
        performer,
        duration,
        albumId,
        createdAt,
        updatedAt,
      ],
    };

    const res = await this.query(query.text, query.values);

    if (!res.rows[0].id) throw new InvariantError("Lagu gagal ditambahkan");

    return res.rows[0].id;
  }

  async getSongs({ title, performer }) {
    let queryText = "SELECT id, title, performer FROM songs";
    let index = 1;
    const queryValues = [];
    const conditions = [];

    if (title) {
      conditions.push(`title ILIKE $${index++}`);
      queryValues.push(`%${title}%`);
    }

    if (performer) {
      conditions.push(`performer ILIKE $${index++}`);
      queryValues.push(`%${performer}%`);
    }

    if (conditions.length > 0) {
      queryText += ` WHERE ${conditions.join(" AND ")}`;
    }

    const res = await this.query(queryText, queryValues);

    return res.rows;
  }

  async getSongById(id) {
    const query = {
      text: `SELECT id, title, year, genre, performer, duration, album_id 
             FROM songs WHERE id = $1`,
      values: [id],
    };

    const res = await this.query(query.text, query.values);

    if (!res.rows.length) throw new ClientError("Lagu tidak ditemukan", 404);

    return res.rows[0];
  }

  async editSongById(id, { title, year, genre, performer, duration, albumId }) {
    const updatedAt = new Date().toISOString();

    const query = {
      text: `UPDATE songs 
             SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6, updated_at = $7 
             WHERE id = $8 RETURNING id`,
      values: [title, year, genre, performer, duration, albumId, updatedAt, id],
    };

    const res = await this.query(query.text, query.values);

    if (!res.rows.length)
      throw new ClientError("Gagal memperbarui lagu. Id tidak ditemukan", 404);
  }

  async deleteSongById(id) {
    const query = {
      text: "DELETE FROM songs WHERE id = $1 RETURNING id",
      values: [id],
    };

    const res = await this.query(query.text, query.values);

    if (!res.rows.length)
      throw new ClientError("Lagu gagal dihapus. Id tidak ditemukan", 404);
  }
}

module.exports = SongsService;
