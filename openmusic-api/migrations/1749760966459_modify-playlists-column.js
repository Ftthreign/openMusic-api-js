/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.alterColumn("playlists", "owner", {
    notNull: false,
  });

  pgm.dropConstraint("playlists", "fk_playlists.owner_users.id");
  pgm.addConstraint("playlists", "fk_playlists.owner_users.id", {
    foreignKeys: {
      columns: "owner",
      references: "users(id)",
      onDelete: "set null",
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.alterColumn("playlists", "owner", {
    notNull: false,
  });

  pgm.dropConstraint("playlists", "fk_playlists.owner_users.id");
  pgm.addConstraint("playlists", "fk_playlists.owner_users.id", {
    foreignKeys: {
      columns: "owner",
      references: "users(id)",
      onDelete: "set null",
    },
  });
};
