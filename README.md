# Orçamentista IA — CAPTURAOBRA

Dashboard de orçamentação inteligente para construção civil no Paraná.

## Pré-requisitos

- Node.js 18+ instalado
- Chave da API Anthropic (`ANTHROPIC_API_KEY`)

## Instalação e uso

### 1. Configurar a API Key

```bash
export ANTHROPIC_API_KEY=sk-ant-sua_chave_aqui
```

Ou no Windows (PowerShell):
```powershell
$env:ANTHROPIC_API_KEY="sk-ant-sua_chave_aqui"
```

### 2. Iniciar o servidor

```bash
node server.js
```

### 3. Abrir no navegador

```
http://localhost:3333
```

---

## Estrutura do projeto

```
capturaobra-orcamentista/
├── server.js          # Servidor Node.js + proxy da API Anthropic
├── public/
│   └── index.html     # Dashboard completo (HTML + CSS + JS)
└── README.md
```

## Funcionalidades

- **Orçamentista IA** — chat com IA especializada em construção civil PR
- **Histórico** — registro de orçamentos gerados na sessão
- **Tabelas de Referência** — SINAPI, SEOP-PR, TCPO, mercado PR
- **Configurações** — cidade padrão, BDI, regime de mão de obra

## Referências de precificação

- SINAPI/CEF — Sistema Nacional de Pesquisa de Custos
- SEOP-PR — Secretaria de Obras Públicas do Paraná
- TCPO — Tabela de Composições de Preços (Pini)
- Pesquisa de mercado: Curitiba, Londrina, Maringá, Cascavel, Ponta Grossa

## Para integrar ao Claude Code

Se quiser rodar direto no Claude Code como ferramenta MCP, adicione ao seu `claude.json`:

```json
{
  "tools": [
    {
      "name": "orcamentista",
      "description": "Orçamentista de construção civil CAPTURAOBRA",
      "command": "node",
      "args": ["/caminho/para/capturaobra-orcamentista/server.js"]
    }
  ]
}
```
