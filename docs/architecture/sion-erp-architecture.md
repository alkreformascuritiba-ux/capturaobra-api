# Arquitetura proposta — SION ERP

## Objetivo da fase

Esta fase não implementa os módulos do ERP. Ela documenta a arquitetura alvo, cria a estrutura inicial de pastas, define o desenho do banco de dados e organiza o roadmap para aprovação antes da implementação módulo a módulo.

## Decisões arquitetônicas

### Aplicação web modular

O ERP será organizado por módulos de negócio independentes em `src/modules`, com código de UI, regras de apresentação, serviços, tipos e testes próximos ao domínio de cada módulo. Essa separação reduz acoplamento e permite evoluir desde o início os domínios específicos da construção civil: CRM Comercial, Gestão de Obras, Diário de Obra, Cronograma Físico-Financeiro, Medições, Orçamentos com SINAPI/SEOP/TCPO/composições próprias, Compras e Cotações, Estoque, Fornecedores, Equipamentos, RH e Equipes, Segurança do Trabalho, Gestão Documental, Financeiro e BI/Dashboard.

### Camadas

A aplicação seguirá quatro camadas principais:

1. **App shell** (`src/app`): roteamento, providers globais, layout autenticado, tema claro/escuro e tratamento global de erros.
2. **Módulos** (`src/modules/*`): telas, componentes específicos, schemas de formulário, hooks e casos de uso de cada domínio.
3. **Compartilhado** (`src/shared`): componentes reutilizáveis, utilitários, tipos comuns, validações e abstrações de UI acessíveis.
4. **Integrações** (`src/integrations`): clientes e adaptadores para Supabase, Google APIs e GitHub.

### Front-end

A base recomendada é React + TypeScript com Vite. O TypeScript deverá operar em modo estrito para reduzir erros em tempo de execução. Tailwind CSS será usado para design system utilitário, com tokens de cor, espaçamento e estados de tema.

### Back-end e dados

O Supabase será o back-end primário, usando PostgreSQL, Supabase Auth, Row Level Security e Storage. Funções server-side ou endpoints Node.js serão usados apenas para integrações que exigirem segredos, webhooks, processamento assíncrono ou chamadas a APIs externas.

### Autenticação e autorização

A autenticação será feita com Supabase Auth. A autorização será baseada em perfis e permissões salvos no banco, reforçada por Row Level Security. A UI deve ocultar ações não permitidas, mas a segurança decisiva ficará no banco e nas funções server-side.

### LGPD e auditoria

Dados pessoais serão classificados no modelo de dados. A aplicação deve registrar logs administrativos, trilhas de auditoria para alterações sensíveis e políticas de retenção/exportação. Campos de documentos e observações devem ser usados com parcimônia para evitar coleta excessiva.

### Acessibilidade e responsividade

Os componentes compartilhados devem ser acessíveis por teclado, ter estados de foco visíveis, labels associados e contraste adequado. O layout será mobile-first, com navegação lateral adaptada para telas menores.

## Estrutura inicial de pastas

```txt
src/
  app/                         # providers, rotas, layouts e bootstrap do front-end
  config/                      # configuração tipada de ambiente e feature flags
  integrations/
    supabase/                  # cliente Supabase, queries compartilhadas e helpers de auth
    google/                    # Google Sheets, Drive e Calendar
    github/                    # integração GitHub
  modules/
    administracao/             # usuários, perfis, permissões e logs
    crm-comercial/             # clientes, propostas, pipeline, follow-up e agenda
    fornecedores/              # cadastro, homologação, documentos, avaliação e pesquisa
    compras-cotacoes/          # solicitações, cotações, aprovações, pedidos e recebimentos
    estoque/                   # almoxarifado, materiais, movimentações e inventário
    obras/                     # cadastro e visão executiva das obras
    diario-obra/               # RDO, clima, mão de obra, ocorrências, fotos e checklist
    cronograma-fisico-financeiro/ # planejamento físico, marcos e desembolso
    medicoes/                  # medição de serviços, evidências e aprovações
    orcamentos/                # SINAPI, SEOP, TCPO, composições próprias, BDI e PDF
    equipamentos/              # máquinas, ferramentas, locações, manutenção e uso
    rh-equipes/                # funcionários, equipes, alocação, documentos e EPIs
    seguranca-trabalho/        # treinamentos, APR/PT, incidentes e conformidade
    gestao-documental/         # ART, contratos, notas fiscais, anexos e validade
    financeiro/                # contas, caixa, centros de custo e relatórios
    bi-dashboard/              # indicadores e visão executiva
  shared/
    components/                # componentes reutilizáveis e acessíveis
    hooks/                     # hooks genéricos
    lib/                       # bibliotecas internas e clientes base
    types/                     # tipos globais
    utils/                     # funções puras reutilizáveis
tests/                         # testes de integração/e2e quando aplicável
supabase/
  migrations/                  # migrations SQL versionadas
```

## Convenções propostas

- Cada módulo deve expor apenas o necessário por um `index.ts` local.
- Formulários devem usar schemas de validação tipados.
- Chamadas ao Supabase devem ficar em serviços ou hooks dedicados, nunca espalhadas diretamente em componentes complexos.
- Erros de domínio devem ser tratados com mensagens amigáveis e logs técnicos separados.
- Comentários devem explicar decisões não óbvias, não repetir o que o código já expressa.
