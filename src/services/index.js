const AlbumsService = require("./postgres/AlbumsService");
const SongsService = require("./postgres/SongsService");
const UsersService = require("./postgres/UsersService");
const AuthenticationsService = require("./postgres/AuthenticationsService");
const PlaylistsService = require("./postgres/PlaylistsService");
const CollaborationsService = require("./postgres/CollaborationsService");
const PlaylistActivitiesService = require("./PlaylistActivitiesService");

module.exports = {
  AlbumsService,
  SongsService,
  UsersService,
  AuthenticationsService,
  PlaylistsService,
  CollaborationsService,
  PlaylistActivitiesService,
};
