const autoBind = require("auto-bind");

class UploadsHandler {
  constructor(albumsService, storageService, validator) {
    this._albumsService = albumsService;
    this._storageService = storageService;
    this._validator = validator;

    autoBind(this);
  }

  async postAlbumCoverHandler(req, h) {
    const { cover } = req.payload;
    const { id: albumId } = req.params;

    if (!cover || !cover.hapi) {
      throw new InvariantError("Berkas gambar tidak ditemukan");
    }

    this._validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._storageService.writeFile(cover, cover.hapi);
    const coverUrl = `http://${req.info.host}/albums/covers/${filename}`;

    await this._albumsService.updateAlbumCover(albumId, coverUrl);

    const res = h.response({
      status: "success",
      message: "Sampul berhasil diunggah",
    });

    res.code(201);
    return res;
  }
}

module.exports = UploadsHandler;
