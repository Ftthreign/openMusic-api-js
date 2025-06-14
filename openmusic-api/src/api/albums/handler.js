const autoBind = require("auto-bind");

class AlbumsHandler {
  constructor(service, validator, likesService) {
    this._service = service;
    this._validator = validator;
    this._likesService = likesService;

    autoBind(this);
  }

  async postAlbumHandler(req, h) {
    this._validator.validateAlbumPayload(req.payload);
    const { name, year } = req.payload;

    const albumId = await this._service.addAlbum({ name, year });

    const res = h.response({
      status: "success",
      message: "Album berhasil ditambahkan",
      data: {
        albumId,
      },
    });

    res.code(201);

    return res;
  }

  async getAlbumByIdHandler(req, h) {
    const { id } = req.params;
    const album = await this._service.getAlbumByIdWithSongs(id);

    return {
      status: "success",
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(req, h) {
    this._validator.validateAlbumPayload(req.payload);
    const { id } = req.params;
    const { name, year } = req.payload;

    await this._service.editAlbumById(id, { name, year });

    return {
      status: "success",
      message: "Album berhasil diperbarui",
    };
  }

  async deleteAlbumByIdHandler(req, h) {
    const { id } = req.params;
    await this._service.deleteAlbumById(id);

    return {
      status: "success",
      message: "Album berhasil dihapus",
    };
  }

  async postAlbumLikeHandler(req, h) {
    const { id: albumId } = req.params;
    const { userId: credentialId } = req.auth.credentials;

    await this._likesService.addLike(albumId, credentialId);

    const res = h.response({
      status: "success",
      message: "Album berhasil disukai",
    });

    res.code(201);
    return res;
  }

  async deleteAlbumLikeHandler(req, h) {
    const { id: albumId } = req.params;
    const { userId: credentialId } = req.auth.credentials;

    await this._likesService.deleteLike(albumId, credentialId);

    return {
      status: "success",
      message: "Album batal disukai",
    };
  }

  async getAlbumLikesCountHandler(req, h) {
    const { id: albumId } = req.params;
    const { count, dataSource } = await this._likesService.getAlbumLikesCount(
      albumId
    );

    const res = h.response({
      status: "success",
      data: {
        likes: count,
      },
    });

    if (dataSource === "cache") res.header("X-Data-Source", "cache");

    return res;
  }
}

module.exports = AlbumsHandler;
