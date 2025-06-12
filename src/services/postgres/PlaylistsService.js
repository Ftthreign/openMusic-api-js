const { nanoid } = require("nanoid");
const PostgresdbService = require("./PostgresdbService");
const {
  InvariantError,
  ClientError,
  AuthorizationError,
} = require("../../utils");

class PlaylistsService extends PostgresdbService {
  constructor(collaborationsService) {
    super();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: "INSERT INTO playlists VALUES($1, $2, $3, $4, $5) RETURNING id",
      values: [id, name, owner, createdAt, updatedAt],
    };

    const res = await this.query(query.text, query.values);

    if (!res.rows[0].id) throw new InvariantError("Playlist gagal ditambahkan");

    return res.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id INNER JOIN users ON playlists.owner = users.id WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
      values: [owner],
    };

    const res = await this.query(query.text, query.values);

    return res.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: "DELETE FROM playlists WHERE id = $1 RETURNING id",
      values: [id],
    };

    const res = await this.query(query.text, query.values);

    if (!res.rows.length)
      throw new ClientError("Playlist gagal dihapus. Id tidak ditemukan", 404);
  }

  async addSongToPlaylist(playlistId, songId) {
    const checkSongQuery = {
      text: "SELECT id FROM songs WHERE id = $1",
      values: [songId],
    };

    const checkSongResult = await this.query(
      checkSongQuery.text,
      checkSongQuery.values
    );

    if (!checkSongResult.rows.length)
      throw new ClientError(
        "Gagal menambahkan lagu ke playlist. Song Id tidak ditemukan",
        404
      );

    const id = `playlistsong-${nanoid(16)}`;
    const query = {
      text: "INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id",
      values: [id, playlistId, songId],
    };

    const res = await this.query(query.text, query.values);

    if (!res.rows.length)
      throw new InvariantError("Lagu gagal ditambahkan ke playlist");

    return res.rows[0].id;
  }

  async getPlaylistSongs(playlistId) {
    const query = {
      text: "SELECT playlists.id, playlists.name, users.username, songs.id as song_id, songs.title, songs.performer FROM playlists LEFT JOIN playlist_songs ON playlist_songs.playlist_id = playlists.id LEFT JOIN songs ON songs.id = playlist_songs.song_id INNER JOIN users ON playlists.owner = users.id WHERE playlists.id = $1",
      values: [playlistId],
    };

    const res = await this.query(query.text, query.values);

    if (!res.rows.length)
      throw new ClientError("Playlist tidak ditemukan", 404);

    const playlist = {
      id: res.rows[0].id,
      name: res.rows[0].name,
      username: res.rows[0].username,
      songs: res.rows[0].song_id
        ? res.rows.map((row) => ({
            id: row.song_id,
            title: row.title,
            performer: row.performer,
          }))
        : [],
    };

    return playlist;
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: "DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id",
      values: [playlistId, songId],
    };

    const res = await this.query(query.text, query.values);

    if (!res.rows.length)
      throw new InvariantError("Lagu gagal dihapus dari playlist");
  }

  async verifyPlaylistOwner(playlistId, userId) {
    const query = {
      text: "SELECT owner FROM playlists WHERE id = $1",
      values: [playlistId],
    };

    const res = await this.query(query.text, query.values);

    if (!res.rows.length)
      throw new ClientError("Playlist tidak ditemukan", 404);

    const playlist = res.rows[0];

    if (playlist.owner !== userId)
      throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (e) {
      if (e instanceof ClientError && e.statusCode === 404) {
        throw e;
      }

      try {
        await this._collaborationsService.verifyCollaborator(
          playlistId,
          userId
        );
      } catch {
        throw new AuthorizationError(
          "Anda tidak berhak mengakses resource ini"
        );
      }
    }
  }
}

module.exports = PlaylistsService;
