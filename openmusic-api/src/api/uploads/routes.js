const routes = (handler) => [
  {
    method: "POST",
    path: "/albums/{id}/covers",
    handler: (req, h) => handler.postAlbumCoverHandler(req, h),
    options: {
      payload: {
        allow: ["multipart/form-data"],
        multipart: true,
        output: "stream",
        maxBytes: 512000,
        parse: true,
      },
    },
  },
];

module.exports = routes;
