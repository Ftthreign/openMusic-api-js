const { Pool } = require("pg");
const { InvariantError } = require("../../openmusic-api/src/utils");

class PlaylistsService {
  constructor() {
    this._pool = new Pool({
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      host: process.env.PGHOST,
      port: process.env.PGPORT,
    });
  }

  async getPlaylistSongs(playlistId) {
    const playlistQuery = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists INNER JOIN users ON playlists.owner = users.id WHERE playlists.id = $1`,
      values: [playlistId],
    };

    const playlistResult = await this._pool.query(
      playlistQuery.text,
      playlistQuery.values
    );

    if (!playlistResult.rows.length) {
      return null;
    }

    const playlist = playlistResult.rows[0];

    const songsQuery = {
      text: `SELECT songs.id, songs.title, songs.performer FROM playlist_songs INNER JOIN songs ON songs.id = playlist_songs.song_id WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    };

    const songResult = await this._pool.query(
      songsQuery.text,
      songsQuery.values
    );

    playlist.songs = songResult.rows;

    delete playlist.username;

    return playlist;
  }
}

module.exports = PlaylistsService;
