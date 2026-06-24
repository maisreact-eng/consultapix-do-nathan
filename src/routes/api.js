const express = require('express');
const pixValidator = require('../services/pixValidator');
const pixLookup = require('../services/pixLookup');
const configStore = require('../config/store');
const optionalAuth = require('../middleware/optionalAuth');

const router = express.Router();

// Documentação da API
router.get('/', (req, res) => {
  const cfg = configStore.load();
  res.json({
    name: 'PIXCheck API',
    version: '1.0.0',
    auth: cfg.apiKey
      ? 'API key obrigatória — passe via header X-Api-Key ou query ?api_key='
      : 'Sem autenticação (configure uma API key nas configurações para proteger)',
    endpoints: [
      {
        method: 'GET',
        path: '/api/pix?key=<chave>',
        description: 'Valida uma chave PIX e retorna banco e titular',
        example: 'GET /api/pix?key=contato@exemplo.com',
      },
      {
        method: 'POST',
        path: '/api/pix',
        description: 'Mesma consulta via corpo JSON',
        example: 'POST /api/pix  Body: { "key": "contato@exemplo.com" }',
      },
    ],
    response: {
      valid: 'boolean — se o formato da chave é válido',
      type: 'CPF | CNPJ | EMAIL | PHONE | EVP',
      key: 'chave normalizada',
      found: 'boolean | null — se está cadastrada no DICT (null se sem provedor)',
      bank: '{ name, ispb } | null',
      holder: '{ name } | null',
      message: 'string | null — aviso quando não há provedor configurado',
    },
  });
});

async function handlePix(key, res) {
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
}

router.get('/pix', optionalAuth, (req, res) => handlePix(req.query.key, res));

router.post('/pix', optionalAuth, (req, res) => handlePix(req.body?.key, res));

module.exports = router;
