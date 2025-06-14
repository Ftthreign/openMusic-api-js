const { nanoid } = require("nanoid");
const PostgresdbService = require("./PostgresdbService");
const { InvariantError, AuthorizationError } = require("../../utils");

class CollaborationsService extends PostgresdbService {
  constructor(playlistsService, usersService) {
    super();
    this._playlistsService = playlistsService;
    this._usersService = usersService;
  }

  async addCollaboration(playlistId, userId) {
    await this._playlistsService.getPlaylistSongs(playlistId);
    await this._usersService.getUserById(userId);

    const checkQuery = {
      text: "SELECT id FROM collaborations WHERE playlist_id = $1 AND user_id = $2",
      values: [playlistId, userId],
    };

    const checkResult = await this.query(checkQuery.text, checkQuery.values);

    if (checkResult.rows.length)
      throw new InvariantError("Kolaborasi sudah ada");

    const id = `collab-${nanoid(16)}`;
    const query = {
      text: "INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id",
      values: [id, playlistId, userId],
    };

    const res = await this.query(query.text, query.values);

    if (!res.rows.length)
      throw new InvariantError("Kolaborasi gagal ditambahkan");

    return res.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: "DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id",
      values: [playlistId, userId],
    };

    const res = await this.query(query.text, query.values);

    if (!res.rows.length)
      throw new InvariantError(
        "Kolaborasi gagal dihapus. Kolaborasi tidak ditemukan"
      );
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: "SELECT id FROM collaborations WHERE playlist_id = $1 AND user_id = $2",
      values: [playlistId, userId],
    };

    const res = await this.query(query.text, query.values);

    if (!res.rows.length)
      throw new AuthorizationError(
        "Anda tidak berhak mengakses resource ini (bukan kolaborator)."
      );
  }
}

module.exports = CollaborationsService;
