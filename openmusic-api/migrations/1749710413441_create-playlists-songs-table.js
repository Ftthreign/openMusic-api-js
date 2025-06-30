/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable("playlist_songs", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    playlist_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    song_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
  });

  pgm.addConstraint(
    "playlist_songs",
    "fk_playlist_songs.playlist_id_playlisys.id",
    {
      foreignKeys: {
        columns: "playlist_id",
        references: "playlists(id)",
        onDelete: "cascade",
      },
    }
  );

  pgm.addConstraint("playlist_songs", "fk_playlist_songs.songs_id_songs.id", {
    foreignKeys: {
      columns: "song_id",
      references: "songs(id)",
      onDelete: "cascade",
    },
  });

  pgm.addConstraint("playlist_songs", "unique_playlist_id_and_song_id", {
    unique: ["playlist_id", "song_id"],
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("playlist_songs");
};
