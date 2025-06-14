const AlbumsService = require("./postgres/AlbumsService");
const SongsService = require("./postgres/SongsService");
const UsersService = require("./postgres/UsersService");
const AuthenticationsService = require("./postgres/AuthenticationsService");
const PlaylistsService = require("./postgres/PlaylistsService");
const CollaborationsService = require("./postgres/CollaborationsService");
const PlaylistActivitiesService = require("./PlaylistActivitiesService");
const LikesService = require("./postgres/LikesService");
const ProducerService = require("./producer/ProducerService");
const StorageService = require("./storage/StorageService");
const CacheService = require("./CacheService");

module.exports = {
  AlbumsService,
  SongsService,
  UsersService,
  AuthenticationsService,
  PlaylistsService,
  CollaborationsService,
  PlaylistActivitiesService,
  LikesService,
  ProducerService,
  StorageService,
  CacheService,
};
