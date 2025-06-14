const autoBind = require("auto-bind");

class PlaylistsHandler {
  constructor(service, validator, activitiesService) {
    this._service = service;
    this._validator = validator;
    this._activitiesService = activitiesService;

    autoBind(this);
  }

  async postPlaylistHandler(req, h) {
    console.log("--- Debugging postPlaylistHandler ---");
    console.log("request.auth:", req.auth);
    console.log("req.auth.credentials:", req.auth.credentials);
    console.log(
      "req.auth.credentials.id:",
      req.auth.credentials ? req.auth.credentials.id : "undefined or null"
    );
    console.log("-----------------------------------");
    this._validator.validatePlaylistPayload(req.payload);
    const { name } = req.payload;
    const { userId: credentialId } = req.auth.credentials;
    const playlistId = await this._service.addPlaylist({
      name,
      owner: credentialId,
    });

    const res = h.response({
      status: "success",
      message: "Playlist berhasil ditambahkan",
      data: {
        playlistId,
      },
    });

    res.code(201);
    return res;
  }

  async getPlaylistsHandler(req, h) {
    const { userId: credentialId } = req.auth.credentials;
    const playlists = await this._service.getPlaylists(credentialId);

    return {
      status: "success",
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(req, h) {
    const { id } = req.params;
    const { userId: credentialId } = req.auth.credentials;

    await this._service.verifyPlaylistOwner(id, credentialId);

    await this._service.deletePlaylistById(id);

    return {
      status: "success",
      message: "Playlist berhasil dihapus",
    };
  }

  async postSongToPlaylistHandler(req, h) {
    this._validator.validatePlaylistSongPayload(req.payload);
    const { id: playlistId } = req.params;
    const { songId } = req.payload;
    const { userId: credentialId } = req.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.addSongToPlaylist(playlistId, songId);
    await this._activitiesService.addActivity({
      playlistId,
      songId,
      userId: credentialId,
      action: "add",
    });

    const res = h.response({
      status: "success",
      message: "Lagu berhasil ditambahkan ke playlist",
    });

    res.code(201);
    return res;
  }

  async getPlaylistSongsHandler(req, h) {
    const { id: playlistId } = req.params;
    const { userId: credentialId } = req.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    const playlist = await this._service.getPlaylistSongs(playlistId);

    return {
      status: "success",
      data: {
        playlist,
      },
    };
  }

  async deleteSongFromPlaylistHandler(req, h) {
    this._validator.validatePlaylistSongPayload(req.payload);

    const { id: playlistId } = req.params;
    const { songId } = req.payload;
    const { userId: credentialId } = req.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.deleteSongFromPlaylist(playlistId, songId);

    await this._activitiesService.addActivity({
      playlistId,
      songId,
      userId: credentialId,
      action: "delete",
    });

    return {
      status: "success",
      message: "Lagu berhasil dihapus dari playlist",
    };
  }

  async getPlaylistActivitiesHandler(req, h) {
    const { id: playlistId } = req.params;
    const { userId: credentialId } = req.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);

    const activities = await this._activitiesService.getPlaylistActivities(
      playlistId
    );

    return {
      status: "success",
      data: {
        playlistId,
        activities,
      },
    };
  }
}

module.exports = PlaylistsHandler;
