const autoBind = require("auto-bind");

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postSongHandler(req, h) {
    this._validator.validateSongPayload(req.payload);
    const { title, year, genre, performer, duration, albumId } = req.payload;

    const songId = await this._service.addSong({
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
    });

    const res = h.response({
      status: "success",
      message: "Lagu berhasil ditambahkan",
      data: {
        songId,
      },
    });

    res.code(201);
    return res;
  }

  async getSongHandler(req, h) {
    const { title, performer } = req.query;
    const songs = await this._service.getSongs({ title, performer });
    return {
      status: "success",
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler(req, h) {
    const { id } = req.params;
    const song = await this._service.getSongById(id);

    return {
      status: "success",
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler(req, h) {
    this._validator.validateSongPayload(req.payload);
    const { id } = req.params;
    const { title, year, genre, performer, duration, albumId } = req.payload;

    await this._service.editSongById(id, {
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
    });

    return {
      status: "success",
      message: "Lagu berhasil diperbarui",
    };
  }

  async deleteSongByIdHandler(req, h) {
    const { id } = req.params;
    await this._service.deleteSongById(id);

    return {
      status: "success",
      message: "Lagu berhasil dihapus",
    };
  }
}

module.exports = SongsHandler;
