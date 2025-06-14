const Jwt = require("@hapi/jwt");
const { InvariantError, config } = require("../utils");

const tokenManager = {
  generateAccessToken: (payload) =>
    Jwt.token.generate(payload, config.jwt.accessTokenKey),
  generateRefreshToken: (payload) =>
    Jwt.token.generate(payload, config.jwt.refreshTokenKey),
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = Jwt.token.decode(refreshToken);
      Jwt.token.verifySignature(artifacts, config.jwt.refreshTokenKey);
      Jwt.token.verify(artifacts, config.jwt.refreshTokenKey);
      const { payload } = artifacts.decoded;

      return payload;
    } catch (e) {
      throw new InvariantError("Refresh token tidak valid");
    }
  },
};

module.exports = tokenManager;
