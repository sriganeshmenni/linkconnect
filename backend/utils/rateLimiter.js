const rateLimit = require('express-rate-limit');
const RateLimitConfig = require('../models/RateLimitConfig');

let config = {
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
};

let limiter = rateLimit({ windowMs: config.windowMs, max: config.max });

// Middleware that always uses the current limiter instance
const rateLimitMiddleware = (req, res, next) => {
  return limiter(req, res, next);
};

const updateConfig = ({ windowMs, max, updatedBy }) => {
  config = {
    ...config,
    ...(typeof windowMs === 'number' && !Number.isNaN(windowMs) ? { windowMs } : {}),
    ...(typeof max === 'number' && !Number.isNaN(max) ? { max } : {}),
  };
  limiter = rateLimit({ windowMs: config.windowMs, max: config.max });

  // Persist latest settings (upsert single document)
  RateLimitConfig.findOneAndUpdate(
    {},
    {
      windowMs: config.windowMs,
      max: config.max,
      updatedBy: updatedBy || null,
      updatedAt: new Date(),
    },
    { upsert: true, new: true }
  ).catch((err) => {
    console.warn('RateLimitConfig persist error:', err.message);
  });

  return config;
};

const getConfig = () => config;

// Load persisted config on startup (non-blocking)
const initRateLimiter = async () => {
  try {
    const latest = await RateLimitConfig.findOne().sort({ updatedAt: -1 }).lean();
    if (latest) {
      config = { windowMs: latest.windowMs, max: latest.max };
      limiter = rateLimit({ windowMs: config.windowMs, max: config.max });
      console.log(`Rate limiter initialized from DB: windowMs=${config.windowMs}, max=${config.max}`);
    }
  } catch (err) {
    console.warn('RateLimitConfig init error:', err.message);
  }
};

module.exports = {
  rateLimitMiddleware,
  updateConfig,
  getConfig,
  initRateLimiter,
};
