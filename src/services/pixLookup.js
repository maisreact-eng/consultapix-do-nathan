const axios = require('axios');

let efiToken = null;
let efiTokenExpires = 0;

async function lookupAsaas(key, cfg) {
  const base = cfg.sandbox
    ? 'https://sandbox.asaas.com/api/v3'
    : 'https://api.asaas.com/api/v3';

  const res = await axios.get(`${base}/pix/addressKeys/info`, {
    params: { addressKey: key },
    headers: { access_token: cfg.apiKey },
  });

  const d = res.data;
  return {
    found: true,
    bank: { name: d.bankName || null, ispb: d.ispb || null },
    holder: { name: d.name || null, document: d.cpfCnpj || null },
  };
}

async function getEfiToken(cfg) {
  if (efiToken && Date.now() < efiTokenExpires) return efiToken;
  const base = cfg.sandbox ? 'https://pix-h.api.efipay.com.br' : 'https://pix.api.efipay.com.br';
  const creds = Buffer.from(`${cfg.clientId}:${cfg.clientSecret}`).toString('base64');
  const res = await axios.post(
    `${base}/oauth/token`,
    { grant_type: 'client_credentials' },
    { headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/json' } }
  );
  efiToken = res.data.access_token;
  efiTokenExpires = Date.now() + (res.data.expires_in - 60) * 1000;
  return efiToken;
}

async function lookupEfi(key, cfg) {
  const base = cfg.sandbox ? 'https://pix-h.api.efipay.com.br' : 'https://pix.api.efipay.com.br';
  const token = await getEfiToken(cfg);
  const res = await axios.get(`${base}/v2/pix/entries/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const d = res.data;
  return {
    found: true,
    bank: {
      name: d.account?.participant || null,
      ispb: d.account?.ispb || null,
      branch: d.account?.branch || null,
      accountType: d.account?.accountType || null,
    },
    holder: { name: d.owner?.name || null, type: d.owner?.type || null },
  };
}

// O App ID do Woovi é o Client_Id:Client_Secret do Efí Pay em Base64.
// Woovi usa a infraestrutura do Efí Pay por baixo.
let wooviToken = null;
let wooviTokenExpires = 0;

async function getWooviToken(appId) {
  if (wooviToken && Date.now() < wooviTokenExpires) return wooviToken;

  // Decodifica o App ID para extrair clientId e clientSecret
  const decoded = Buffer.from(appId, 'base64').toString('utf-8');
  const [clientId, clientSecret] = decoded.split(':');

  const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await axios.post(
    'https://pix.api.efipay.com.br/oauth/token',
    { grant_type: 'client_credentials' },
    { headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/json' } }
  );

  wooviToken = res.data.access_token;
  wooviTokenExpires = Date.now() + (res.data.expires_in - 60) * 1000;
  return wooviToken;
}

async function lookupWoovi(key, cfg) {
  const token = await getWooviToken(cfg.appId);
  const res = await axios.get(`https://pix.api.efipay.com.br/v2/pix/entries/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const d = res.data;
  return {
    found: true,
    bank: {
      name: d.account?.participant || null,
      ispb: d.account?.ispb || null,
      branch: d.account?.branch || null,
      accountType: d.account?.accountType || null,
    },
    holder: { name: d.owner?.name || null, type: d.owner?.type || null },
  };
}

async function lookup(key, config) {
  const { provider, asaas, efi, woovi } = config;

  if (provider === 'none') {
    return { found: null, bank: null, holder: null, message: 'Nenhum provedor configurado. Configure nas ⚙ Configurações.' };
  }

  try {
    if (provider === 'asaas') return await lookupAsaas(key, asaas);
    if (provider === 'efi')   return await lookupEfi(key, efi);
    if (provider === 'woovi') return await lookupWoovi(key, woovi);
  } catch (err) {
    if (err.response?.status === 404) {
      return { found: false, bank: null, holder: null, message: 'Chave PIX não cadastrada no DICT.' };
    }
    if (err.response?.status === 401 || err.response?.status === 403) {
      throw new Error('Credenciais inválidas. Verifique a configuração do provedor.');
    }
    throw err;
  }
}

module.exports = { lookup };
