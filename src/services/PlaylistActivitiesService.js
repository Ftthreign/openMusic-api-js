const { nanoid } = require("nanoid");
const PostgresdbService = require("./postgres/PostgresdbService");

class PlaylistActivitiesService extends PostgresdbService {
  constructor() {
    super();
  }

  async addActivity({ playlistId, songId, userId, action }) {
    const id = `activity-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: "INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id",
      values: [id, playlistId, songId, userId, action, time],
    };

    await this.query(query.text, query.values);
  }

  async getPlaylistActivities(playlistId) {
    const query = {
      text: "SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time FROM playlist_song_activities INNER JOIN users ON users.id = playlist_song_activities.user_id INNER JOIN songs ON songs.id = playlist_song_activities.song_id WHERE playlist_song_activities.playlist_id = $1 ORDER BY playlist_song_activities.time ASC",
      values: [playlistId],
    };

    const res = await this.query(query.text, query.values);

    return res.rows;
  }
}

module.exports = PlaylistActivitiesService;
