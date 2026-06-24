const EXAMPLES = {
  email: 'nathanwevylly@gmail.com',
  phone: '+5511999887766',
  cpf: '529.982.247-25',
  cnpj: '11.222.333/0001-81',
  evp: 'a4e1b1a7-3c2f-4b7e-9f0d-1a2b3c4d5e6f',
};

const pixInput = document.getElementById('pixInput');
const btnSearch = document.getElementById('btnSearch');
const btnClear = document.getElementById('btnClear');
const btnText = document.getElementById('btnText');
const btnSpinner = document.getElementById('btnSpinner');
const resultEl = document.getElementById('result');

const btnSettings = document.getElementById('btnSettings');
const overlay = document.getElementById('overlay');
const btnCloseModal = document.getElementById('btnCloseModal');
const btnSave = document.getElementById('btnSave');
const saveMsg = document.getElementById('saveMsg');

// ── Tags de exemplo ──
document.querySelectorAll('.tag[data-example]').forEach(btn => {
  btn.addEventListener('click', () => {
    pixInput.value = EXAMPLES[btn.dataset.example] || '';
    updateClear();
    pixInput.focus();
  });
});

// ── Input / Clear ──
pixInput.addEventListener('input', updateClear);
pixInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
btnClear.addEventListener('click', () => { pixInput.value = ''; updateClear(); resultEl.innerHTML = ''; pixInput.focus(); });

function updateClear() {
  btnClear.classList.toggle('visible', pixInput.value.length > 0);
}

// ── Busca ──
btnSearch.addEventListener('click', doSearch);

async function doSearch() {
  const key = pixInput.value.trim();
  if (!key) { pixInput.focus(); return; }

  setLoading(true);
  resultEl.innerHTML = '';

  try {
    const res = await fetch(`/api/pix?key=${encodeURIComponent(key)}`);
    const data = await res.json();
    renderResult(data);
  } catch {
    renderError('Erro de conexão. Verifique se o servidor está rodando.');
  } finally {
    setLoading(false);
  }
}

function setLoading(v) {
  btnSearch.disabled = v;
  btnText.style.display = v ? 'none' : '';
  btnSpinner.style.display = v ? '' : 'none';
}

// ── Renderizar resultado ──
function renderResult(d) {
  if (!d.valid) {
    resultEl.innerHTML = `
      <div class="result-card error">
        <div class="result-status">
          <span class="status-icon">✗</span>
          <span>Chave inválida</span>
          ${d.type ? `<span class="badge">${d.type}</span>` : ''}
        </div>
        <p style="color:var(--error);font-size:.9rem">${d.error}</p>
      </div>`;
    return;
  }

  const typeLabel = { CPF: 'CPF', CNPJ: 'CNPJ', EMAIL: 'E-mail', PHONE: 'Telefone', EVP: 'Chave Aleatória' }[d.type] || d.type;

  let statusClass = 'success';
  let statusIcon = '✓';
  let statusText = 'Chave válida e cadastrada';

  if (d.found === false) { statusClass = 'error'; statusIcon = '✗'; statusText = 'Chave não cadastrada no PIX'; }
  if (d.found === null)  { statusClass = 'warn';  statusIcon = '◎'; statusText = 'Formato válido'; }

  const bankName = d.bank?.name || '—';
  const ispb = d.bank?.ispb || '—';
  const holderName = d.holder?.name || '—';

  let rows = `
    <div class="label">Tipo</div>     <div class="value"><span class="badge">${typeLabel}</span></div>
    <div class="label">Chave</div>    <div class="value">${esc(d.key)}</div>
    <div class="label">Banco</div>    <div class="value">${esc(bankName)}</div>
    <div class="label">ISPB</div>     <div class="value">${esc(ispb)}</div>
    <div class="label">Titular</div>  <div class="value">${esc(holderName)}</div>
  `;

  const msgBlock = d.message
    ? `<div class="result-msg">ℹ ${esc(d.message)}</div>`
    : d.error
    ? `<div class="result-msg" style="background:var(--error-bg);color:var(--error)">⚠ ${esc(d.error)}</div>`
    : '';

  resultEl.innerHTML = `
    <div class="result-card ${statusClass}">
      <div class="result-status">
        <span class="status-icon">${statusIcon}</span>
        <span>${statusText}</span>
        <span class="badge">${typeLabel}</span>
      </div>
      <div class="result-grid">${rows}</div>
      ${msgBlock}
    </div>`;
}

function renderError(msg) {
  resultEl.innerHTML = `
    <div class="result-card error">
      <div class="result-status"><span class="status-icon">⚠</span><span>${esc(msg)}</span></div>
    </div>`;
}

function esc(s) {
  if (!s) return s;
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Modal de Configurações ──
btnSettings.addEventListener('click', openModal);
btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

async function openModal() {
  overlay.classList.add('open');
  saveMsg.textContent = '';
  try {
    const res = await fetch('/api/config');
    const cfg = await res.json();
    applyConfig(cfg);
  } catch {}
}

function closeModal() { overlay.classList.remove('open'); }

function applyConfig(cfg) {
  setProvider(cfg.provider || 'none');
  document.getElementById('asaasKey').value = cfg.asaas?.apiKey || '';
  document.getElementById('asaasSandbox').checked = cfg.asaas?.sandbox !== false;
  document.getElementById('efiClientId').value = cfg.efi?.clientId || '';
  document.getElementById('efiClientSecret').value = cfg.efi?.clientSecret || '';
  document.getElementById('efiSandbox').checked = cfg.efi?.sandbox !== false;
  document.getElementById('wooviAppId').value = cfg.woovi?.appId || '';
  document.getElementById('apiKeyField').value = cfg.apiKey || '';
}

// Provider tabs
document.getElementById('providerTabs').addEventListener('click', e => {
  const tab = e.target.closest('.ptab');
  if (tab) setProvider(tab.dataset.p);
});

function setProvider(p) {
  document.querySelectorAll('.ptab').forEach(t => t.classList.toggle('active', t.dataset.p === p));
  document.getElementById('panel-asaas').style.display = p === 'asaas' ? '' : 'none';
  document.getElementById('panel-efi').style.display   = p === 'efi'   ? '' : 'none';
  document.getElementById('panel-woovi').style.display = p === 'woovi' ? '' : 'none';
  document.getElementById('panel-none').style.display  = p === 'none'  ? '' : 'none';
}

btnSave.addEventListener('click', async () => {
  const provider = document.querySelector('.ptab.active')?.dataset.p || 'none';
  const body = {
    provider,
    apiKey: document.getElementById('apiKeyField').value.trim(),
    asaas: {
      apiKey: document.getElementById('asaasKey').value.trim(),
      sandbox: document.getElementById('asaasSandbox').checked,
    },
    efi: {
      clientId: document.getElementById('efiClientId').value.trim(),
      clientSecret: document.getElementById('efiClientSecret').value.trim(),
      sandbox: document.getElementById('efiSandbox').checked,
    },
    woovi: {
      appId: document.getElementById('wooviAppId').value.trim(),
    },
  };

  try {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    saveMsg.textContent = data.message || 'Salvo!';
    saveMsg.style.color = 'var(--success)';
    setTimeout(closeModal, 1200);
  } catch {
    saveMsg.textContent = 'Erro ao salvar.';
    saveMsg.style.color = 'var(--error)';
  }
});
