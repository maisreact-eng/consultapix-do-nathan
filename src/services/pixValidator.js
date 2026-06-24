const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+55\d{10,11}$/;

function validateCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
  let rem = (sum * 10) % 11;
  if (rem === 10 || rem === 11) rem = 0;
  if (rem !== parseInt(cpf[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
  rem = (sum * 10) % 11;
  if (rem === 10 || rem === 11) rem = 0;
  return rem === parseInt(cpf[10]);
}

function validateCNPJ(cnpj) {
  cnpj = cnpj.replace(/\D/g, '');
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  const calc = (s, len) => {
    let sum = 0, pos = len - 7;
    for (let i = len; i >= 1; i--) { sum += parseInt(s[len - i]) * pos--; if (pos < 2) pos = 9; }
    const r = sum % 11; return r < 2 ? 0 : 11 - r;
  };
  return calc(cnpj, 12) === parseInt(cnpj[12]) && calc(cnpj, 13) === parseInt(cnpj[13]);
}

function validate(key) {
  if (!key || typeof key !== 'string') return { valid: false, type: null, error: 'Chave não informada.' };
  const k = key.trim();

  if (UUID_REGEX.test(k)) return { valid: true, type: 'EVP', key: k };
  if (EMAIL_REGEX.test(k)) return { valid: true, type: 'EMAIL', key: k };
  if (PHONE_REGEX.test(k)) return { valid: true, type: 'PHONE', key: k };

  const digits = k.replace(/\D/g, '');
  if (digits.length === 11) {
    if (!validateCPF(digits)) return { valid: false, type: 'CPF', error: 'CPF com dígitos verificadores inválidos.' };
    return { valid: true, type: 'CPF', key: digits };
  }
  if (digits.length === 14) {
    if (!validateCNPJ(digits)) return { valid: false, type: 'CNPJ', error: 'CNPJ com dígitos verificadores inválidos.' };
    return { valid: true, type: 'CNPJ', key: digits };
  }

  return { valid: false, type: null, error: 'Formato de chave PIX não reconhecido.' };
}

module.exports = { validate };
