const { SongPayloadSchema } = require("./schema");
const { InvariantError } = require("../../utils");

const SongsValidator = {
  validateSongPayload: (payload) => {
    const validationResult = SongPayloadSchema.validate(payload);

    if (validationResult.error)
      throw new InvariantError(validationResult.error.message);
  },
};

module.exports = SongsValidator;
