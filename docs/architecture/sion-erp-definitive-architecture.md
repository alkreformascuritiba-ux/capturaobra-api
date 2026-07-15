# Arquitetura definitiva — SION ERP

## 1. Revisão crítica da proposta anterior

A proposta inicial acertou ao separar o ERP por módulos, adotar React + TypeScript + Vite, Supabase/PostgreSQL e autenticação centralizada. Porém, para um ERP de construção civil, a arquitetura precisava ser mais rigorosa em pontos que afetam escala, segurança, operação e evolução do produto.

### Problemas identificados

1. **Migration prematura**: criar uma migration completa antes de validar fluxos reais induz acoplamento cedo demais. O correto nesta etapa é definir o modelo conceitual e lógico, deixando migrations executáveis para a versão de fundação aprovada.
2. **RBAC insuficiente**: apenas listar roles e permissions não resolve autorização por contexto. Um ERP de obras exige permissões por organização, obra, centro de custo, área e ação.
3. **RLS ainda genérico**: habilitar Row Level Security sem políticas formais pode bloquear o produto ou gerar falsa sensação de segurança. As políticas devem ser desenhadas por domínio.
4. **Ausência de fronteiras de domínio**: compras, financeiro, obras e orçamentos têm forte relacionamento, mas não devem manipular diretamente regras internas uns dos outros.
5. **Auditoria e logs pouco detalhados**: sistemas ERP precisam registrar alterações sensíveis, eventos de segurança, aprovações, alterações financeiras e acesso a documentos.
6. **Integrações sem camada anticorrupção**: Google Sheets, Drive, Calendar, GitHub e futuramente WhatsApp devem ser isolados por adaptadores para evitar dependência direta de APIs externas nos módulos.
7. **Estratégia operacional incompleta**: faltavam CI/CD, backup, restore, observabilidade, ambientes, deploy e plano de continuidade.
8. **LGPD genérica**: era necessário definir minimização de dados, base legal, retenção, exportação, anonimização e segregação de documentos.
9. **Testes sem pirâmide definida**: era necessário explicitar testes unitários, integração, contrato, segurança, RLS e e2e.

### Melhorias aplicadas nesta definição

- A arquitetura passa a ser orientada a domínios, com módulos independentes e contratos claros.
- O banco passa a ser definido como modelo lógico versionável, não como migration executável nesta fase.
- O modelo de autorização passa a combinar RBAC com escopo por organização e por obra.
- RLS passa a ser tratada como camada obrigatória de defesa, com políticas derivadas dos casos de uso.
- Integrações externas passam por adaptadores e filas/jobs quando houver processamento assíncrono.
- Auditoria, logs, LGPD, backup, CI/CD e deploy passam a fazer parte da fundação, não de uma etapa posterior.

## 2. Visão geral da arquitetura

O SION ERP será uma aplicação web modular para gestão de construção civil, com front-end em React + TypeScript, back-end baseado em Supabase e funções Node.js para operações privilegiadas, integrações e jobs. A arquitetura será dividida em camadas para manter baixo acoplamento e alta testabilidade.

```txt
Usuário
  ↓
React App (Vite + TypeScript + Tailwind)
  ↓
Camada de aplicação por módulo
  ↓
Serviços de domínio / hooks / validações
  ↓
Adaptadores de dados e integrações
  ↓
Supabase Auth + PostgreSQL + Storage + Edge/Node Functions
  ↓
Serviços externos: Google, GitHub, e-mail, WhatsApp futuro
```

## 3. Princípios arquitetônicos

1. **Modularidade por domínio**: cada módulo possui telas, componentes, schemas, serviços e testes próprios.
2. **Banco como fonte da verdade**: dados transacionais ficam no PostgreSQL; documentos ficam no Supabase Storage com metadados no banco.
3. **Segurança em profundidade**: UI restringe ações, API valida regras, RLS protege os dados e auditoria registra operações.
4. **Contratos explícitos entre módulos**: módulos não acessam detalhes internos uns dos outros; interações ocorrem por serviços públicos e tipos compartilhados.
5. **TypeScript estrito**: todo código novo deve ser tipado, com validação em bordas de entrada.
6. **Acessibilidade desde a fundação**: componentes base devem cumprir navegação por teclado, foco visível, labels e contraste.
7. **LGPD por design**: coleta mínima, retenção definida, rastreabilidade, controle de acesso e anonimização quando aplicável.

## 4. Estrutura de pastas definitiva

```txt
src/
  app/
    providers/                 # Supabase, tema, query client, router e tratamento global de erros
    routes/                    # definição de rotas públicas, privadas e por permissão
    layouts/                   # layouts autenticado, público e páginas de erro
  config/
    env.ts                     # leitura e validação tipada de variáveis de ambiente
    permissions.ts             # catálogo client-side de permissões conhecidas
  integrations/
    supabase/                  # cliente browser/server, helpers de sessão e storage
    google/                    # adaptadores para Sheets, Drive e Calendar
    github/                    # adaptadores para GitHub
  modules/
    administracao/
      components/
      pages/
      schemas/
      services/
      types/
      tests/
    crm/
      components/
      pages/
      schemas/
      services/
      types/
      tests/
    crm-comercial/              # pipeline, propostas, agenda e follow-up comercial
    fornecedores/               # homologação, avaliação e documentos de fornecedores
    compras-cotacoes/           # solicitações, cotações, aprovações e pedidos
    estoque/                    # almoxarifado, materiais, movimentações e inventário
    obras/                      # cadastro e visão executiva das obras
    diario-obra/                # RDO, clima, mão de obra, ocorrências e fotos
    cronograma-fisico-financeiro/ # planejamento físico, marcos e desembolso
    medicoes/                   # medições de serviços, evidências e aprovação
    orcamentos/                 # SINAPI, SEOP, TCPO e composições próprias
    equipamentos/               # máquinas, ferramentas, locações, manutenção e uso
    rh-equipes/                 # funcionários, equipes, alocação e documentos
    seguranca-trabalho/         # EPIs, treinamentos, incidentes, APR/PT e conformidade
    gestao-documental/          # ART, contratos, notas fiscais, anexos e validade
    financeiro/                 # pagar, receber, caixa, centros de custo e relatórios
    bi-dashboard/               # indicadores, BI operacional e visão diretiva
  shared/
    components/                # design system e componentes acessíveis
    hooks/                     # hooks sem regra específica de domínio
    lib/                       # clientes, formatadores, query helpers e erros base
    schemas/                   # schemas reutilizáveis
    types/                     # tipos globais e DTOs compartilhados
    utils/                     # funções puras
server/
  functions/                   # funções Node/Edge para integrações, webhooks e jobs privilegiados
  jobs/                        # tarefas agendadas e rotinas operacionais
supabase/
  migrations/                  # migrations somente após aprovação da fundação
  policies/                    # políticas RLS documentadas e versionadas
docs/
  architecture/
  database/
  roadmap/
tests/
  e2e/
  integration/
  security/
```

## 5. Diagrama dos módulos

```txt
                           ┌────────────────┐
                           │  Administração │
                           │ usuários/RBAC  │
                           └───────┬────────┘
                                   │
┌────────────┐     ┌───────────────▼───────────────┐     ┌──────────────┐
│ Dashboard  │◄────│        Núcleo do ERP          │────►│ Auditoria    │
│ indicadores│     │ auth, permissões, tenant, logs│     │ logs/eventos │
└─────┬──────┘     └───────────────┬───────────────┘     └──────────────┘
      │                            │
┌─────▼──────┐   ┌────────────────▼───────────────┐   ┌──────────────┐
│ CRM Comercial│►│ Orçamentos                     │──►│ Gestão Obras │
│ propostas   │ │ SINAPI/SEOP/TCPO/composições   │   │ execução     │
└─────┬──────┘   └────────────────┬───────────────┘   └──────┬───────┘
      │                           │                          │
┌─────▼──────────┐       ┌────────▼────────┐        ┌────────▼────────┐
│ Fornecedores   │◄─────►│ Compras/Cotações│──────►│ Financeiro      │
│ homologação    │       │ pedidos/aprovação│       │ pagar/receber   │
└───────┬────────┘       └───────┬───────────┘       └──────┬──────────┘
        │                        │                          │
┌───────▼────────┐       ┌───────▼───────────┐       ┌──────▼─────────┐
│ Estoque        │◄─────►│ Equipamentos      │       │ Gestão Docs    │
│ almoxarifado   │       │ uso/manutenção    │       │ ART/NF/contrato│
└───────┬────────┘       └───────┬───────────┘       └──────┬─────────┘
        │                        │                          │
┌───────▼────────┐       ┌───────▼───────────┐       ┌──────▼─────────┐
│ Diário de Obra │◄─────►│ Medições          │◄─────►│ Cronograma F/F │
│ RDO/fotos      │       │ avanço/aprovação  │       │ físico/finance.│
└───────┬────────┘       └───────┬───────────┘       └──────┬─────────┘
        │                        │                          │
        └──────────────►┌────────▼────────┐◄────────────────┘
                        │ RH/Equipes +    │
                        │ Segurança Trab. │
                        └─────────────────┘
```

## 6. Relacionamento entre módulos

| Módulo | Depende de | Fornece para | Observações |
| --- | --- | --- | --- |
| Administração | Supabase Auth | Todos | Define usuários, perfis, permissões, escopos e logs administrativos. |
| CRM Comercial | Administração | Orçamentos, BI/Dashboard | Gerencia leads, clientes, propostas, pipeline, follow-ups e agenda comercial. |
| Orçamentos | CRM Comercial, Administração | Gestão de Obras, Financeiro, BI/Dashboard | Controla SINAPI, SEOP, TCPO, composições próprias, BDI, versões e PDF. |
| Gestão de Obras | CRM Comercial, Orçamentos, RH/Equipes | Diário de Obra, Cronograma Físico-Financeiro, Medições, Compras, Financeiro | Mantém cadastro e visão executiva da obra. |
| Diário de Obra | Gestão de Obras, RH/Equipes, Equipamentos, Segurança do Trabalho | Medições, BI/Dashboard, Gestão Documental | Registra RDO, clima, equipes, equipamentos, ocorrências, fotos e evidências. |
| Cronograma Físico-Financeiro | Gestão de Obras, Orçamentos | Medições, Financeiro, BI/Dashboard | Planeja avanço físico, marcos, desembolso e curva prevista x realizada. |
| Medições | Gestão de Obras, Diário de Obra, Cronograma Físico-Financeiro | Financeiro, BI/Dashboard, Gestão Documental | Mede serviços executados, evidências, aprovações e faturamento. |
| Compras e Cotações | Gestão de Obras, Fornecedores, Estoque, Administração | Estoque, Financeiro, BI/Dashboard | Solicitação, cotação, aprovação, pedido e recebimento. |
| Estoque | Compras e Cotações, Gestão de Obras | Obras, Financeiro, BI/Dashboard | Controla almoxarifado, materiais, movimentações, inventário e consumo por obra. |
| Fornecedores | Administração, Gestão Documental | Compras e Cotações, Financeiro | Homologa fornecedores, controla documentos, avaliações e categorias. |
| Equipamentos | Gestão de Obras, Estoque, Fornecedores | Diário de Obra, Financeiro, BI/Dashboard | Controla máquinas, ferramentas, locações, manutenção, disponibilidade e apropriação de uso. |
| RH e Equipes | Administração, Gestão de Obras | Diário de Obra, Segurança do Trabalho, BI/Dashboard | Gerencia funcionários, equipes, alocações, documentos e produtividade. |
| Segurança do Trabalho | RH e Equipes, Gestão de Obras, Gestão Documental | Diário de Obra, BI/Dashboard | Controla EPIs, treinamentos, APR/PT, incidentes, inspeções e conformidade. |
| Gestão Documental | Todos | Auditoria, Compliance, Financeiro | Centraliza ART, contratos, notas fiscais, anexos, validade, classificação e trilha de acesso. |
| Financeiro | CRM Comercial, Fornecedores, Compras e Cotações, Gestão de Obras, Medições, Estoque, Equipamentos | BI/Dashboard | Controla contas, fluxo de caixa, centro de custo, aprovações e relatórios. |
| BI/Dashboard | Todos | Diretoria/gestão | Consolida indicadores autorizados, obras em andamento, propostas, caixa, compras, estoque, segurança e produtividade. |

## 7. Fluxo de autenticação

1. Usuário acessa a aplicação.
2. App verifica sessão pelo Supabase Auth.
3. Sem sessão, usuário é redirecionado para login.
4. Com sessão, o app carrega `profile`, `organization`, `roles`, `permissions` e escopos.
5. Rotas privadas validam autenticação.
6. Rotas sensíveis validam permissão e escopo.
7. Operações de leitura/escrita passam pelo Supabase com RLS habilitada.
8. Operações privilegiadas passam por funções server-side com validação de JWT e autorização.
9. Eventos sensíveis geram auditoria.

```txt
Login → Supabase Auth → JWT → Profile/Role/Scope → Route Guard → RLS/Function Guard → Audit Log
```

## 8. Modelo de permissões (RBAC + escopo)

O ERP usará RBAC com escopo contextual. A role define o conjunto de permissões; o escopo define onde a permissão vale.

### Entidades de autorização

- `organizations`: empresa/tenant.
- `profiles`: usuário autenticado e seus dados internos.
- `roles`: papéis como `admin`, `diretoria`, `engenharia`, `compras`, `financeiro`, `comercial`, `rh`.
- `permissions`: ações granulares no formato `modulo.recurso.acao`.
- `role_permissions`: permissões por role.
- `profile_roles`: roles atribuídas a usuários.
- `access_scopes`: escopos por organização, obra, centro de custo ou departamento.

### Exemplos de permissões

- `crm.customers.read`
- `crm.customers.write`
- `budgets.versions.approve`
- `projects.diary.write`
- `purchases.orders.approve`
- `finance.payables.approve`
- `admin.users.manage`
- `audit.logs.read`

### Regras

- Permissões administrativas exigem escopo organizacional.
- Permissões de obra exigem vínculo com a obra ou perfil global autorizado.
- Aprovações financeiras e compras exigem dupla validação: permissão e limite de alçada.
- Dashboard respeita permissões de origem dos dados.
- RLS deve negar por padrão e permitir apenas políticas explícitas.

## 9. Modelo do banco de dados

### Núcleo

- `organizations`
- `profiles`
- `roles`
- `permissions`
- `role_permissions`
- `profile_roles`
- `access_scopes`
- `audit_logs`
- `system_events`

### CRM Comercial

- `customers`
- `customer_contacts`
- `commercial_pipeline_stages`
- `commercial_opportunities`
- `commercial_proposals`
- `commercial_activities`
- `commercial_follow_ups`

### Fornecedores

- `suppliers`
- `supplier_categories`
- `supplier_documents`
- `supplier_evaluations`
- `supplier_homologations`

### Compras e Cotações

- `purchase_requests`
- `purchase_request_items`
- `purchase_quotes`
- `purchase_quote_items`
- `purchase_approvals`
- `purchase_orders`
- `purchase_order_items`
- `purchase_receipts`

### Estoque

- `warehouses`
- `stock_items`
- `stock_movements`
- `stock_reservations`
- `stock_inventories`

### Gestão de Obras, Diário, Cronograma e Medições

- `projects`
- `project_cost_centers`
- `project_schedules`
- `project_schedule_milestones`
- `project_measurements`
- `project_measurement_items`
- `site_diary_entries`
- `site_diary_labor`
- `site_diary_equipment`
- `site_diary_occurrences`
- `project_photos`
- `project_checklists`

### Orçamentos

- `budgets`
- `budget_versions`
- `budget_items`
- `budget_compositions`
- `budget_bdi`
- `budget_reference_sources` para SINAPI, SEOP, TCPO e bases próprias
- `budget_reference_items`
- `budget_documents`

### Financeiro

- `accounts_payable`
- `accounts_receivable`
- `cash_flow_entries`
- `payment_methods`
- `financial_approvals`
- `financial_categories`

### Equipamentos

- `equipment_assets`
- `equipment_allocations`
- `equipment_maintenance_orders`
- `equipment_rental_contracts`

### RH, Equipes e Segurança do Trabalho

- `employees`
- `teams`
- `team_members`
- `employee_allocations`
- `employee_documents`
- `ppe_items`
- `ppe_assignments`
- `safety_trainings`
- `safety_inspections`
- `safety_incidents`
- `work_permits`

### Gestão Documental

- `document_folders`
- `documents`
- `document_versions`
- `document_access_logs`
- `legal_art_records`
- `contracts`
- `invoice_documents`

### BI/Dashboard

- `analytics_snapshots`
- `dashboard_widgets`
- `dashboard_saved_views`

### Padrões de tabela

- Toda tabela transacional terá `id`, `organization_id`, `created_at`, `updated_at` e, quando aplicável, `created_by` e `updated_by`.
- Documentos serão armazenados no Storage; o banco manterá metadados, dono, validade, classificação e trilha de acesso.
- Tabelas financeiras usarão `numeric(14,2)` e nunca `float`.
- Status serão controlados por check constraints ou tabelas de domínio quando precisarem ser configuráveis.
- Exclusão física será evitada em entidades críticas; usar `deleted_at` quando houver exigência de histórico.

## 10. Convenções de código

- TypeScript em modo `strict`.
- Componentes em PascalCase.
- Hooks com prefixo `use`.
- Serviços por domínio com nomes explícitos, como `createPurchaseRequest`.
- Schemas de formulário próximos ao módulo.
- Tipos de banco gerados a partir do Supabase e versionados.
- Imports absolutos por alias após configuração do Vite.
- Componentes compartilhados não devem conter regra de negócio.
- Nenhum módulo deve acessar tabelas de outro módulo sem passar por serviço público ou query compartilhada aprovada.
- Comentários apenas para decisões não óbvias.

## 11. Estratégia de testes

### Pirâmide de testes

1. **Unitários**: funções puras, validações, formatadores, regras de cálculo, BDI, alçadas e permissões.
2. **Componentes**: formulários, tabelas, estados vazios, erros, acessibilidade e interações.
3. **Integração**: fluxos módulo + Supabase local, serviços de domínio e RLS.
4. **Contrato**: adaptadores Google, GitHub e webhooks.
5. **E2E**: fluxos críticos como login, criar cliente, gerar orçamento, aprovar compra, registrar medição e lançar financeiro.
6. **Segurança**: testes de RLS, autorização, tentativa de acesso cross-tenant e permissões negadas.

### Ferramentas recomendadas

- Vitest para unitários.
- React Testing Library para componentes.
- Playwright para e2e.
- Supabase local para integração/RLS.
- Axe ou equivalente para acessibilidade.

## 12. Estratégia de deploy

### Ambientes

- `local`: desenvolvimento com Supabase local quando possível.
- `preview`: cada PR publicado na Vercel com banco de desenvolvimento controlado.
- `staging`: ambiente estável para homologação com dados fictícios/mascarados.
- `production`: ambiente final com políticas restritivas, backups e monitoramento.

### Deploy

- Front-end na Vercel.
- Supabase para banco, Auth e Storage.
- Funções Node/Edge para integrações privilegiadas.
- Variáveis de ambiente separadas por ambiente.
- Migrations aplicadas somente por pipeline controlado e com revisão.

## 13. CI/CD

Pipeline recomendado:

1. Instalar dependências.
2. Validar formatação.
3. Rodar lint.
4. Rodar typecheck.
5. Rodar testes unitários.
6. Rodar testes de componentes.
7. Validar migrations e políticas RLS.
8. Rodar e2e em preview quando aplicável.
9. Gerar build.
10. Publicar preview na Vercel.
11. Aplicar migrations em staging/produção apenas com aprovação.

## 14. Backup e restore

- Backup automático diário do PostgreSQL.
- Retenção mínima recomendada de 30 dias para produção.
- Backup de Storage para documentos críticos.
- Teste de restore mensal em ambiente isolado.
- Exportação de dados por organização para continuidade operacional.
- Plano de recuperação com RPO/RTO definidos antes da produção.

## 15. Auditoria

Eventos obrigatórios de auditoria:

- Login e falhas de autenticação relevantes.
- Criação, alteração e desativação de usuários.
- Alteração de roles, permissões e escopos.
- Aprovação/reprovação de compras.
- Alterações em contas a pagar/receber.
- Geração e aprovação de orçamento.
- Alterações em medições de obra.
- Upload, download e exclusão lógica de documentos sensíveis.

Cada evento deve registrar `organization_id`, usuário, ação, entidade, IP quando disponível, user agent, data/hora e metadados mínimos.

## 16. Logs e observabilidade

- Logs técnicos separados de auditoria de negócio.
- Correlação por `request_id` em funções server-side.
- Tratamento global de erros no front-end.
- Monitoramento de falhas de integração.
- Alertas para falhas de backup, erros 5xx, jobs travados e tentativas de acesso negado em volume incomum.
- Logs não devem armazenar segredos, tokens, senhas ou documentos pessoais completos.

## 17. LGPD

### Diretrizes

- Coletar apenas dados necessários para operação da construção civil.
- Classificar dados pessoais e documentos sensíveis.
- Controlar acesso por necessidade operacional.
- Registrar acesso a documentos sensíveis.
- Permitir exportação de dados do titular quando aplicável.
- Anonimizar ou excluir dados conforme retenção e base legal.
- Mascarar dados em staging e ambientes de teste.
- Não usar dados reais em desenvolvimento local sem autorização formal.

### Retenção sugerida

- Dados financeiros e fiscais: conforme obrigações legais aplicáveis.
- Documentos de RH: conforme obrigações trabalhistas aplicáveis.
- Leads perdidos/inativos: política de retenção comercial definida pela empresa.
- Logs técnicos: retenção curta e suficiente para diagnóstico.
- Auditoria: retenção compatível com riscos e obrigações contratuais.

## 18. Roadmap por versões

### v0.1 Fundação

- Aprovar arquitetura definitiva.
- Criar app React + TypeScript + Vite.
- Configurar Tailwind, tema claro/escuro, ESLint, typecheck e testes.
- Configurar Supabase Auth, perfis, roles, permissões e RLS base.
- Criar layout autenticado e estrutura de navegação.
- Configurar CI/CD, ambientes e deploy preview.

### v0.2 CRM

- Clientes e contatos.
- Pipeline comercial.
- Histórico e follow-up.
- Agenda comercial.
- Testes de permissões e formulários.

### v0.3 Fornecedores, Gestão Documental e Estoque inicial

- Cadastro de fornecedores.
- Homologação.
- Upload e validade de documentos.
- Gestão documental inicial para ART, contratos e notas fiscais.
- Estoque inicial para cadastro de materiais e almoxarifados.
- Avaliação, pesquisa e histórico.

### v0.4 Compras, Cotações e Estoque

- Solicitação de compra.
- Cotação.
- Aprovação por alçada.
- Pedido de compra.
- Recebimento.
- Integração com fornecedores, obras, estoque e financeiro.
- Movimentações de estoque por compra, recebimento e consumo.

### v0.5 Gestão de Obras, Diário, Cronograma, Medições e Equipamentos

- Cadastro de obras.
- Cronograma físico-financeiro.
- Medições.
- Diário de obra.
- Fotos.
- Checklist.
- Equipamentos, locações, manutenção e apropriação por obra.
- Vínculo com equipes, segurança do trabalho, estoque e compras.

### v0.6 Orçamentos

- Composições.
- BDI.
- Cronograma.
- PDF.
- Histórico e versionamento.
- Aprovação e conversão para obra.

### v0.7 Financeiro

- Contas a pagar.
- Contas a receber.
- Fluxo de caixa.
- Relatórios financeiros.
- Aprovações e auditoria reforçada.

### v0.8 BI/Dashboard

- Indicadores executivos.
- Obras em andamento.
- Propostas.
- Clientes.
- Fluxo financeiro.
- Estoque, equipamentos, segurança do trabalho e produtividade.
- Visões por permissão.

### v1.0 Produção

- Hardening de segurança.
- Teste completo de backup e restore.
- Observabilidade e alertas.
- Revisão LGPD.
- Documentação de operação.
- Treinamento de usuários.
- Go-live assistido.
