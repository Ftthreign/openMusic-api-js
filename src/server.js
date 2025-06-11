require("dotenv").config();

// hapi plugins
const Hapi = require("@hapi/hapi");
const albums = require("./api/albums");
const songs = require("./api/songs");

// services
const { AlbumsService, SongsService } = require("./services");

// validator
const AlbumsValidator = require("./validators/albums");
const SongsValidator = require("./validators/songs");

// error handling
const { ClientError } = require("./utils");

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ["*"],
      },
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
  ]);

  await server.start();

  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
