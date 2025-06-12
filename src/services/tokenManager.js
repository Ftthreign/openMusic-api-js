const Jwt = require("@hapi/jwt");
const { InvariantError } = require("../utils");

const tokenManager = {
  generateAccessToken: (payload) =>
    Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY),
  generateRefreshToken: (payload) =>
    Jwt.token.generate(payload, process.env.REFRESH_TOKEN_KEY),
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = Jwt.token.decode(refreshToken);
      Jwt.token.verifySignature(artifacts, process.env.REFRESH_TOKEN_KEY);
      const { payload } = artifacts.decoded;

      // const { payload } = Jwt.token.verify(
      //   refreshToken,
      //   process.env.REFRESH_TOKEN_KEY
      // );

      return payload;
    } catch (e) {
      throw new InvariantError("Refresh token tidak valid");
    }
  },
};

module.exports = tokenManager;
