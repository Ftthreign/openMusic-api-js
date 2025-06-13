const autoBind = require("auto-bind");

class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postUserHandler(req, h) {
    console.log(`incoming payload : ${JSON.stringify(req.payload, null, 2)}`);
    this._validator.validateUserPayload(req.payload);

    const { username, password, fullname } = req.payload;

    const userId = await this._service.addUser({
      username,
      password,
      fullname,
    });

    const res = h.response({
      status: "success",
      message: "User berhasil ditambahkan",
      data: {
        userId,
      },
    });

    res.code(201);
    return res;
  }
}

module.exports = UsersHandler;
