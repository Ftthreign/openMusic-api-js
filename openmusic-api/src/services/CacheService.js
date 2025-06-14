const redis = require("redis");
const { config } = require("../utils");

class CacheService {
  constructor() {
    this._client = redis.createClient({
      url: `redis://${config.redis.host}:6379`,
    });

    this._client.on("error", (error) => console.error(`Redis error, ${error}`));
    this._client.connect();
  }

  async set(key, value, expirationInSecond = 3600) {
    await this._client.set(key, value, {
      EX: expirationInSecond,
    });
  }

  async get(key) {
    const res = await this._client.get(key);
    return res;
  }

  async del(key) {
    return this._client.del(key);
  }
}

module.exports = CacheService;
