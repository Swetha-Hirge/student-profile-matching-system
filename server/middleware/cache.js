const redisClient = require('../config/redis');

exports.cacheMiddleware = (keyPrefix) => async (req, res, next) => {
  const key = keyPrefix + JSON.stringify(req.params || {}) + JSON.stringify(req.query || {});
  try {
    const cached = await redisClient.get(key);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    res.sendResponse = res.json;
    res.json = async (body) => {
      await redisClient.setEx(key, 60, JSON.stringify(body)); // TTL = 60s
      res.sendResponse(body);
    };

    next();
  } catch (err) {
    console.error('Redis error:', err);
    next();
  }
};
