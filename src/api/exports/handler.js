const autoBind = require("auto-bind");

class ExportsHandler {
  constructor(playlistsService, producerService, validator) {
    this._playlistsService = playlistsService;
    this._producerService = producerService;
    this._validator = validator;

    autoBind(this);
  }

  async postExportPlaylistsHandler(req, h) {
    console.log(`req path: ${req.path}`);
    console.log(`req params: ${req.params}`);
    this._validator.validateExportPlaylistPayload(req.payload);
    const { playlistId } = req.params;
    const { targetEmail } = req.payload;
    const { userId: credentialId } = req.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    const message = {
      playlistId,
      targetEmail,
    };

    await this._producerService.sendMessage(
      "export:playlists",
      JSON.stringify(message)
    );

    const res = h.response({
      status: "success",
      message: "Permintaan Anda sedang kami proses",
    });

    res.code(201);
    return res;
  }
}

module.exports = ExportsHandler;
