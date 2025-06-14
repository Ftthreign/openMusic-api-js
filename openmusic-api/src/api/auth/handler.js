const autoBind = require("auto-bind");
const tokenManager = require("../../services/tokenManager");

class AuthenticationsHandler {
  constructor(usersService, authenticationsService, validator) {
    this._usersService = usersService;
    this._authenticationsService = authenticationsService;
    this._validator = validator;

    autoBind(this);
  }

  async postAuthenticationHandler(req, h) {
    this._validator.validatePostAuthenticationPayload(req.payload);

    const { username, password } = req.payload;

    const userId = await this._usersService.verifyUserCredential(
      username,
      password
    );

    const accessToken = tokenManager.generateAccessToken({ userId });
    const refreshToken = tokenManager.generateRefreshToken({ userId });

    await this._authenticationsService.addRefreshToken(refreshToken);

    const res = h.response({
      status: "success",
      message: "Authentication berhasil",
      data: {
        accessToken,
        refreshToken,
      },
    });

    res.code(201);
    return res;
  }

  async putAuthenticationHandler(req, h) {
    this._validator.validatePutAuthenticationPayload(req.payload);

    const { refreshToken } = req.payload;

    await this._authenticationsService.verifyRefreshToken(refreshToken);
    const { userId } = tokenManager.verifyRefreshToken(refreshToken);
    const accessToken = tokenManager.generateAccessToken({ userId });

    return {
      status: "success",
      message: "Access Token berhasil diperbarui",
      data: {
        accessToken,
      },
    };
  }

  async deleteAuthenticationHandler(req, h) {
    this._validator.validateDeleteAuthenticationPayload(req.payload);

    const { refreshToken } = req.payload;

    await this._authenticationsService.verifyRefreshToken(refreshToken);
    await this._authenticationsService.deleteRefreshToken(refreshToken);

    return {
      status: "success",
      message: "Refresh token berhasil dihapus",
    };
  }
}

module.exports = AuthenticationsHandler;
