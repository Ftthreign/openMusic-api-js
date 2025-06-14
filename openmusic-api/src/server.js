require("dotenv").config();

// hapi library
const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");
const Inert = require("@hapi/inert");

const path = require("path");

const albums = require("./api/albums");
const songs = require("./api/songs");
const users = require("./api/users");
const authentications = require("./api/auth");
const playlists = require("./api/playlists");
const collaborations = require("./api/collaborations");
const exportsPlugin = require("./api/exports");
const uploads = require("./api/uploads");

// services
const {
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
} = require("./services");

// validator
const AlbumsValidator = require("./validators/albums");
const SongsValidator = require("./validators/songs");
const UsersValidator = require("./validators/users");
const AuthenticationsValidator = require("./validators/auth");
const PlaylistsValidator = require("./validators/playlists");
const CollaborationsValidator = require("./validators/collaborations");
const ExportsValidator = require("./validators/exports");
const UploadsValidator = require("./validators/uploads");

// error handling and configuration
const {
  ClientError,
  AuthenticationError,
  AuthorizationError,
  config,
} = require("./utils");

const init = async () => {
  const cacheService = new CacheService();
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const playlistsActivitiesService = new PlaylistActivitiesService();
  const producerService = ProducerService;
  const storageService = new StorageService(
    path.resolve(__dirname, "../albums/covers")
  );
  const likesService = new LikesService(albumsService, cacheService);
  const collaborationsService = new CollaborationsService(null, usersService);
  const playlistsService = new PlaylistsService(collaborationsService);

  collaborationsService._playlistsService = playlistsService;

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  await server.register([Jwt, Inert]);

  server.auth.strategy("openmusic_jwt", "jwt", {
    keys: config.jwt.accessTokenKey,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: config.jwt.accessTokenAge,
    },
    validate: (artifacts, request, h) => {
      const { userId } = artifacts.decoded.payload;

      request.auth.credentials = { userId };

      return { isValid: true };
    },
  });

  server.ext("onPreResponse", (req, h) => {
    const { response } = req;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: "fail",
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (!response.isServer) {
        return h.continue;
      }

      console.error(response);
      const newResponse = h.response({
        status: "error",
        message: "Terjadi kegagalan pada server",
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
        likesService: likesService,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        usersService: usersService,
        authenticationsService: authenticationsService,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
        activitiesService: playlistsActivitiesService,
      },
    },
    {
      plugin: collaborations,
      options: {
        service: collaborationsService,
        playlistsService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: exportsPlugin,
      options: {
        playlistsService: playlistsService,
        producerService: producerService,
        validator: ExportsValidator,
      },
    },
    {
      plugin: uploads,
      options: {
        albumsService: albumsService,
        storageService: storageService,
        validator: UploadsValidator,
      },
    },
  ]);

  server.route({
    method: "GET",
    path: "/albums/covers/{param*}",
    handler: {
      directory: {
        path: path.resolve(__dirname, "../albums/covers"),
      },
    },
  });

  await server.start();

  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
