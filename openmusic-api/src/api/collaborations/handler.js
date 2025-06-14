const autoBind = require("auto-bind");

class CollaborationsHandler {
  constructor(service, playlistsService, validator) {
    this._service = service;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postCollaborationHandler(req, h) {
    this._validator.validateCollaborationPayload(req.payload);
    const { playlistId, userId } = req.payload;
    const { userId: credentialId } = req.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    const collaborationId = await this._service.addCollaboration(
      playlistId,
      userId
    );

    const res = h.response({
      status: "success",
      message: "Kolaborasi berhasil ditambahkan",
      data: {
        collaborationId,
      },
    });

    res.code(201);
    return res;
  }

  async deleteCollaborationHandler(req, h) {
    this._validator.validateCollaborationPayload(req.payload);

    const { playlistId, userId } = req.payload;
    const { userId: credentialId } = req.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._service.deleteCollaboration(playlistId, userId);

    return {
      status: "success",
      message: "Kolaborasi berhasil dihapus",
    };
  }
}

module.exports = CollaborationsHandler;
