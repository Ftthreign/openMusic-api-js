const routes = (handler) => [
  {
    method: "POST",
    path: "/playlists",
    handler: (req, h) => handler.postPlaylistHandler(req, h),
    options: {
      auth: "openmusic_jwt",
    },
  },
  {
    method: "GET",
    path: "/playlists",
    handler: (req, h) => handler.getPlaylistsHandler(req, h),
    options: {
      auth: "openmusic_jwt",
    },
  },
  {
    method: "DELETE",
    path: "/playlists/{id}",
    handler: (req, h) => handler.deletePlaylistByIdHandler(req, h),
    options: {
      auth: "openmusic_jwt",
    },
  },
  {
    method: "POST",
    path: "/playlists/{id}/songs",
    handler: (req, h) => handler.postSongToPlaylistHandler(req, h),
    options: {
      auth: "openmusic_jwt",
    },
  },
  {
    method: "GET",
    path: "/playlists/{id}/songs",
    handler: (req, h) => handler.getPlaylistSongsHandler(req, h),
    options: {
      auth: "openmusic_jwt",
    },
  },
  {
    method: "DELETE",
    path: "/playlists/{id}/songs",
    handler: (req, h) => handler.deleteSongFromPlaylistHandler(req, h),
    options: {
      auth: "openmusic_jwt",
    },
  },
  {
    method: "GET",
    path: "/playlists/{id}/activities",
    handler: (req, h) => handler.getPlaylistActivitiesHandler(req, h),
    options: {
      auth: "openmusic_jwt",
    },
  },
];

module.exports = routes;
