/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable("user_album_likes", {
    id: {
      type: "VARCHAR(255)",
      primaryKey: true,
    },
    user_id: {
      type: "VARCHAR(255)",
    },
    album_id: {
      type: "VARCHAR(255)",
    },
  });

  pgm.addConstraint(
    "user_album_likes",
    "fk_user_album_likes.user_id_users.id",
    {
      foreignKeys: {
        columns: "user_id",
        references: "users(id)",
        onDelete: "cascade",
      },
    }
  );

  pgm.addConstraint(
    "user_album_likes",
    "fk_user_album_likes.album_id_albums.id",
    {
      foreignKeys: {
        columns: "album_id",
        references: "albums(id)",
        onDelete: "cascade",
      },
    }
  );

  pgm.addConstraint("user_album_likes", "unique_user_id_and_album_id", {
    unique: ["user_id", "album_id"],
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("user_album_likes");
};
