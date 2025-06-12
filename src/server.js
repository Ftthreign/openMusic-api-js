require("dotenv").config();

// hapi plugins
const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");

const albums = require("./api/albums");
const songs = require("./api/songs");
const users = require("./api/users");
const authentications = require("./api/auth");
const playlists = require("./api/playlists");
const collaborations = require("./api/collaborations");

// services
const {
  AlbumsService,
  SongsService,
  UsersService,
  AuthenticationsService,
  PlaylistsService,
  CollaborationsService,
  PlaylistActivitiesService,
} = require("./services");

// validator
const AlbumsValidator = require("./validators/albums");
const SongsValidator = require("./validators/songs");
const UsersValidator = require("./validators/users");
const AuthenticationsValidator = require("./validators/auth");
const PlaylistsValidator = require("./validators/playlists");
const CollaborationsValidator = require("./validators/collaborations");

// error handling
const { ClientError } = require("./utils");

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const playlistsActivitiesService = new PlaylistActivitiesService();
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

  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  server.auth.strategy("openmusic_jwt", "jwt", {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts, request, h) => {
      const { id } = artifacts.decoded.payload;

      request.auth.credentials = { id };

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
  ]);

  await server.start();

  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
