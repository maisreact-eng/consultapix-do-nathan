const configStore = require('../config/store');

module.exports = function optionalAuth(req, res, next) {
  const { apiKey } = configStore.load();
  if (!apiKey) return next();

  const provided = req.headers['x-api-key'] || req.query.api_key;
  if (!provided || provided !== apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Informe a API key via header X-Api-Key ou query ?api_key=',
    });
  }
  next();
};
