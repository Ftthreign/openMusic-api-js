/**
 * @type {import('node-pg-migrate').MigrationBuilder}
 */
export const shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const up = (pgm) => {
  // Hapus constraint foreign key lama (jika constraint sebelumnya ada)
  pgm.dropConstraint("playlists", "fk_playlists.owner_users.id");

  // Ubah kolom owner jadi NOT NULL
  pgm.alterColumn("playlists", "owner", {
    notNull: true,
  });

  // Tambahkan kembali constraint foreign key
  pgm.addConstraint("playlists", "fk_playlists.owner_users.id", {
    foreignKeys: {
      columns: "owner",
      references: "users(id)",
      onDelete: "CASCADE",
    },
  });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const down = (pgm) => {
  // Drop constraint
  pgm.dropConstraint("playlists", "fk_playlists.owner_users.id");

  // Ubah owner jadi nullable lagi
  pgm.alterColumn("playlists", "owner", {
    notNull: false,
  });

  // Tambahkan kembali constraint foreign key dengan versi nullable
  pgm.addConstraint("playlists", "fk_playlists.owner_users.id", {
    foreignKeys: {
      columns: "owner",
      references: "users(id)",
      onDelete: "CASCADE",
    },
  });
};
