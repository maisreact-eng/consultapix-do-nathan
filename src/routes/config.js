const express = require('express');
const configStore = require('../config/store');

const router = express.Router();

router.get('/config', (req, res) => {
  const cfg = configStore.load();
  // Não expõe secrets completos no GET, só indica se estão preenchidos
  res.json({
    provider: cfg.provider,
    asaas: { apiKey: cfg.asaas.apiKey, sandbox: cfg.asaas.sandbox },
    efi: { clientId: cfg.efi.clientId, clientSecret: cfg.efi.clientSecret, sandbox: cfg.efi.sandbox },
  });
});

router.post('/config', (req, res) => {
  const { provider, asaas, efi } = req.body;
  if (!['none', 'asaas', 'efi'].includes(provider)) {
    return res.status(400).json({ error: 'Provedor inválido.' });
  }
  configStore.save({ provider, asaas, efi });
  res.json({ ok: true, message: 'Configuração salva.' });
});

module.exports = router;
