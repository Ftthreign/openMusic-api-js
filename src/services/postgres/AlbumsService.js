const { nanoid } = require("nanoid");
const PostgresdbService = require("./PostgresdbService");
const { InvariantError, ClientError } = require("../../utils");

class AlbumsService extends PostgresdbService {
  constructor() {
    super();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: "INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id",
      values: [id, name, year, createdAt, updatedAt],
    };

    const res = await this.query(query.text, query.values);

    if (!res.rows[0].id) {
      throw new InvariantError("Album gagal ditambahkan");
    }

    return res.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: "SELECT id, name, year, cover_url FROM albums WHERE id = $1",
      values: [id],
    };

    const res = await this.query(query.text, query.values);

    if (!res.rows.length) throw new ClientError("Album tidak ditemukan", 404);

    const album = res.rows[0];

    album.coverUrl = album.cover_url;
    delete album.cover_url;

    return album;
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: "UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id",
      values: [name, year, updatedAt, id],
    };

    const res = await this.query(query.text, query.values);

    if (!res.rows.length)
      throw new ClientError("Gagal memperbarui album. Id tidak ditemukan", 404);
  }

  async deleteAlbumById(id) {
    const query = {
      text: "DELETE FROM albums WHERE id = $1 RETURNING id",
      values: [id],
    };

    const res = await this.query(query.text, query.values);

    if (!res.rows.length)
      throw new ClientError("Album gagal dihapus. Id tidak ditemukan", 404);
  }

  async getAlbumByIdWithSongs(id) {
    const albumQuery = {
      text: "SELECT id, name, year, cover_url FROM albums WHERE id = $1",
      values: [id],
    };

    const albumResult = await this.query(albumQuery.text, albumQuery.values);
    if (!albumResult.rows.length)
      throw new ClientError("Album tidak ditemukan", 404);

    const album = albumResult.rows[0];
    album.coverUrl = album.cover_url;
    delete album.cover_url;

    const songsQuery = {
      text: 'SELECT id, title, performer FROM songs WHERE "album_id" = $1',
      values: [id],
    };

    const songsResult = await this.query(songsQuery.text, songsQuery.values);

    album.songs = songsResult.rows;

    return album;
  }

  async updateAlbumCover(albumId, coverUrl) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: "UPDATE albums SET cover_url = $1, updated_at = $2 WHERE id = $3 RETURNING id",
      values: [coverUrl, updatedAt, albumId],
    };

    const res = await this.query(query.text, query.values);

    if (!res.rows.length)
      throw new ClientError(
        "Gagal memperbarui sampul album. Id album tidak ditemukan",
        404
      );
  }
}

module.exports = AlbumsService;
