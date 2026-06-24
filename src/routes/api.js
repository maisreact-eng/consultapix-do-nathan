const express = require('express');
const pixValidator = require('../services/pixValidator');
const pixLookup = require('../services/pixLookup');
const configStore = require('../config/store');

const router = express.Router();

router.get('/pix', async (req, res) => {
  const { key } = req.query;

  const validation = pixValidator.validate(key);
  if (!validation.valid) {
    return res.status(422).json({ valid: false, type: validation.type, error: validation.error });
  }

  const config = configStore.load();

  try {
    const result = await pixLookup.lookup(validation.key, config);
    return res.json({
      valid: true,
      type: validation.type,
      key: validation.key,
      found: result.found,
      bank: result.bank,
      holder: result.holder,
      message: result.message || null,
    });
  } catch (err) {
    return res.status(502).json({
      valid: true,
      type: validation.type,
      key: validation.key,
      found: null,
      bank: null,
      holder: null,
      error: err.message || 'Erro ao consultar o provedor PIX.',
    });
  }
});

module.exports = router;
