# PIXCheck

Validador de chaves PIX com interface web local e API REST para automações. Cole qualquer tipo de chave (CPF, CNPJ, e-mail, telefone ou chave aleatória) e veja se ela é válida e qual banco está vinculado.

## Funcionalidades

Validação local de formato com algoritmo completo para CPF e CNPJ

Consulta real no DICT do BACEN via Asaas ou Efí Pay para ver o banco e o titular

Interface web que abre automaticamente no navegador ao iniciar

API REST com CORS que funciona para scripts, n8n, Make, Zapier e qualquer automação

API key opcional — se configurada, protege o acesso ao endpoint

## Requisitos

Node.js 18 ou superior

## Instalação e uso

```bash
git clone https://github.com/maisreact-eng/consultapix-do-nathan.git
cd consultapix-do-nathan
npm install
npm start
```

O navegador abre sozinho em `http://localhost:3333`

## Documentação da API

A API fica disponível em `http://localhost:3333/api` enquanto o servidor estiver rodando. Acesse esse endereço no navegador para ver a documentação completa em JSON.

### Validar chave PIX via GET

```
GET http://localhost:3333/api/pix?key=<chave>
```

Exemplo com curl:

```bash
curl "http://localhost:3333/api/pix?key=contato@exemplo.com"
```

### Validar chave PIX via POST

```
POST http://localhost:3333/api/pix
Content-Type: application/json

{ "key": "contato@exemplo.com" }
```

### Resposta

```json
{
  "valid": true,
  "type": "EMAIL",
  "key": "contato@exemplo.com",
  "found": true,
  "bank": {
    "name": "Banco Inter",
    "ispb": "00416968"
  },
  "holder": {
    "name": "João Silva"
  },
  "message": null
}
```

Campos da resposta:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| valid | boolean | Se o formato é válido |
| type | string | CPF, CNPJ, EMAIL, PHONE ou EVP |
| key | string | Chave normalizada |
| found | boolean ou null | Se está cadastrada no DICT. null quando sem provedor |
| bank | objeto ou null | Nome e ISPB do banco |
| holder | objeto ou null | Nome do titular |
| message | string ou null | Aviso quando não há provedor configurado |

### Autenticação por API key

Se você configurar uma API key nas Configurações da interface, toda requisição precisa enviá-la:

Via header:

```bash
curl -H "X-Api-Key: sua_chave" "http://localhost:3333/api/pix?key=contato@exemplo.com"
```

Via query:

```bash
curl "http://localhost:3333/api/pix?key=contato@exemplo.com&api_key=sua_chave"
```

### Uso no n8n

Adicione um nó HTTP Request com:
- Method: GET
- URL: `http://localhost:3333/api/pix`
- Query Parameter: `key` = valor da chave PIX
- Header: `X-Api-Key` = sua chave (se configurada)

## Tipos de chave suportados

| Tipo | Exemplo |
|------|---------|
| CPF | 529.982.247-25 |
| CNPJ | 11.222.333/0001-81 |
| E-mail | contato@exemplo.com |
| Telefone | +5511999887766 |
| Chave aleatória (EVP) | a4e1b1a7-3c2f-4b7e-9f0d-... |

## Configurando o provedor PIX

Sem provedor, a ferramenta valida o formato mas não consulta o banco. Configure um dos dois:

### Asaas (mais fácil)

Crie conta grátis em asaas.com, vá em Configurações → Integrações → API Key e copie a chave que começa com `$aact_`. Cole nas Configurações da interface.

### Efí Pay

Crie conta em efipay.com.br, vá em API → Criar Aplicação e copie o Client ID e Client Secret. Cole nas Configurações da interface.

## Tecnologias

Node.js com Express, CORS habilitado, HTML/CSS/JS puro no frontend
