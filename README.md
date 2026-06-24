# PIXCheck

Validador de chaves PIX com interface web local. Cole qualquer tipo de chave (CPF, CNPJ, e-mail, telefone ou chave aleatória) e veja instantaneamente se ela é válida e qual banco está vinculado.

## Funcionalidades

Validação de formato de todos os tipos de chave PIX com algoritmo correto (CPF e CNPJ com dígitos verificadores)

Consulta real no DICT do BACEN via Asaas ou Efí Pay para descobrir o banco e o titular

Interface web limpa que abre automaticamente no navegador ao iniciar

Configuração de provedor direto pelo painel, sem precisar editar arquivos

## Requisitos

Node.js 18 ou superior

## Instalação

```bash
git clone https://github.com/seu-usuario/pixcheck.git
cd pixcheck
npm install
npm start
```

O navegador abre automaticamente em `http://localhost:3333`

## Configuração do provedor PIX

Sem um provedor configurado, a ferramenta ainda valida o formato de qualquer chave. Para ver o banco e o titular, configure um dos provedores abaixo clicando em **Configurações** na interface.

### Asaas (recomendado — mais fácil)

1. Crie conta grátis em asaas.com (aceita CPF, não precisa de CNPJ)
2. Vá em Configurações → Integrações → API Key
3. Copie a chave que começa com `$aact_...`
4. Na interface, clique em Configurações → selecione Asaas → cole a chave → Salvar

Para testes use o Sandbox marcado. Para consultas reais desmarque o Sandbox.

### Efí Pay (Gerencianet)

1. Crie conta em efipay.com.br
2. Vá em API → Criar Aplicação
3. Copie o Client ID e o Client Secret
4. Na interface, clique em Configurações → selecione Efí Pay → preencha os campos → Salvar

## Tipos de chave suportados

| Tipo | Exemplo |
|------|---------|
| CPF | 529.982.247-25 |
| CNPJ | 11.222.333/0001-81 |
| E-mail | contato@exemplo.com |
| Telefone | +5511999887766 |
| Chave aleatória (EVP) | a4e1b1a7-3c2f-4b7e-... |

## Tecnologias

Node.js com Express no backend e HTML/CSS/JS puro no frontend, sem frameworks.

## Feito por

[mcsapo](https://github.com/mcsapo)
