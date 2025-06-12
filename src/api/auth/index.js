const AuthenticationsHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "authentications",
  version: "1.0.0",
  register: async (
    server,
    { usersService, authenticationsService, validator }
  ) => {
    const authenticationHandler = new AuthenticationsHandler(
      usersService,
      authenticationsService,
      validator
    );
    server.route(routes(authenticationHandler));
  },
};
