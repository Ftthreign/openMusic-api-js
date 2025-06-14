const routes = (handler) => [
  {
    method: "POST",
    path: "/albums",
    handler: (req, h) => handler.postAlbumHandler(req, h),
  },
  {
    method: "GET",
    path: "/albums/{id}",
    handler: (req, h) => handler.getAlbumByIdHandler(req, h),
  },
  {
    method: "PUT",
    path: "/albums/{id}",
    handler: (req, h) => handler.putAlbumByIdHandler(req, h),
  },
  {
    method: "DELETE",
    path: "/albums/{id}",
    handler: (req, h) => handler.deleteAlbumByIdHandler(req, h),
  },
  {
    method: "POST",
    path: "/albums/{id}/likes",
    handler: (req, h) => handler.postAlbumLikeHandler(req, h),
    options: {
      auth: "openmusic_jwt",
    },
  },
  {
    method: "GET",
    path: "/albums/{id}/likes",
    handler: (req, h) => handler.getAlbumLikesCountHandler(req, h),
  },
  {
    method: "DELETE",
    path: "/albums/{id}/likes",
    handler: (req, h) => handler.deleteAlbumLikeHandler(req, h),
    options: {
      auth: "openmusic_jwt",
    },
  },
];

module.exports = routes;
