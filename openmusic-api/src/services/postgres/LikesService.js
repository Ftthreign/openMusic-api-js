const { nanoid } = require("nanoid");
const PostgresdbService = require("./PostgresdbService");
const { InvariantError, ClientError } = require("../../utils");

class LikesService extends PostgresdbService {
  constructor(albumsService, cacheService) {
    super();
    this._albumsService = albumsService;
    this._cacheService = cacheService;
    console.log("CacheService is:", this._cacheService);
  }

  async addLike(albumId, userId) {
    const id = `like-${nanoid(16)}`;

    await this._albumsService.getAlbumById(albumId);

    const checkQuery = {
      text: "SELECT id FROM user_album_likes WHERE album_id = $1 AND user_id = $2",
      values: [albumId, userId],
    };

    const query = {
      text: "INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id",
      values: [id, userId, albumId],
    };

    const checkResult = await this.query(checkQuery.text, checkQuery.values);
    if (checkResult.rows.length)
      throw new InvariantError("Anda sudah menyukai album ini.");

    const result = await this.query(query.text, query.values);

    if (!result.rows.length) throw new InvariantError("Gagal Menyukai album.");

    await this._cacheService.del(`album-likes:${albumId}`);

    return result.rows[0].id;
  }

  async deleteLike(albumId, userId) {
    const query = {
      text: "DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id",
      values: [albumId, userId],
    };

    const res = await this.query(query.text, query.values);

    if (!res.rows.length)
      throw new InvariantError(
        "Gagal batal menyukai album. Like tidak ditemukan"
      );

    await this._cacheService.del(`album-likes:${albumId}`);
  }

  async getAlbumLikesCount(albumId) {
    try {
      const res = await this._cacheService.get(`album-likes:${albumId}`);

      if (res) return { count: JSON.parse(res), dataSource: "cache" };
    } catch (e) {
      console.error("Error getting from cache", e);
    }

    const query = {
      text: "SELECT COUNT(id) FROM user_album_likes WHERE album_id = $1",
      values: [albumId],
    };
    const res = await this.query(query.text, query.values);
    const count = parseInt(res.rows[0].count, 10);

    await this._cacheService.set(
      `album-likes:${albumId}`,
      JSON.stringify(count),
      1800
    );

    return { count, dataSource: "database" };
  }
}

module.exports = LikesService;
