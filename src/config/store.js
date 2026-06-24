const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '../../config.json');

const defaults = {
  provider: 'none',
  apiKey: '',
  asaas: { apiKey: '', sandbox: true },
  efi: { clientId: '', clientSecret: '', sandbox: true },
};

function load() {
  try {
    return { ...defaults, ...JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8')) };
  } catch {
    return { ...defaults };
  }
}

function save(data) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2));
}

module.exports = { load, save };
