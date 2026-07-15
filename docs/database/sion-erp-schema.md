# Modelo de banco de dados — SION ERP

Este documento descreve o modelo lógico do banco. Migrations executáveis devem ser criadas apenas após aprovação da arquitetura definitiva, dos fluxos de negócio e das políticas de acesso.

## Estratégia

O banco será PostgreSQL no Supabase, com Supabase Auth, Row Level Security, Storage para documentos e tabelas de auditoria. O desenho segue multi-tenancy por `organization_id`, permissões por RBAC com escopo e políticas de RLS negando acesso por padrão.

## Núcleo administrativo

- `organizations`: empresas/tenants.
- `profiles`: usuários internos vinculados ao Supabase Auth.
- `roles`: papéis por organização.
- `permissions`: ações granulares no formato `modulo.recurso.acao`.
- `role_permissions`: permissões por papel.
- `profile_roles`: papéis atribuídos a usuários.
- `access_scopes`: escopos por organização, obra, centro de custo ou departamento.
- `audit_logs`: auditoria de negócio.
- `system_events`: eventos técnicos e operacionais relevantes.

## CRM Comercial

- `customers`: clientes e leads.
- `customer_contacts`: contatos por cliente.
- `commercial_pipeline_stages`: etapas do pipeline.
- `commercial_opportunities`: oportunidades comerciais.
- `commercial_proposals`: propostas comerciais.
- `commercial_activities`: histórico de interações.
- `commercial_follow_ups`: agenda e próximos passos.

## Fornecedores

- `suppliers`: cadastro principal.
- `supplier_categories`: categorias de fornecimento.
- `supplier_documents`: metadados de documentos no Storage.
- `supplier_evaluations`: avaliações periódicas.
- `supplier_homologations`: homologações e validade.

## Compras e Cotações

- `purchase_requests`: solicitações.
- `purchase_request_items`: itens solicitados.
- `purchase_quotes`: cotações.
- `purchase_quote_items`: itens cotados.
- `purchase_approvals`: aprovações por alçada.
- `purchase_orders`: pedidos de compra.
- `purchase_order_items`: itens do pedido.
- `purchase_receipts`: recebimentos.

## Estoque

- `warehouses`: almoxarifados por obra ou unidade.
- `stock_items`: materiais e insumos.
- `stock_movements`: entradas, saídas, transferências e ajustes.
- `stock_reservations`: reservas para obra/atividade.
- `stock_inventories`: inventários e conferências.

## Gestão de Obras, Diário de Obra, Cronograma e Medições

- `projects`: cadastro das obras.
- `project_cost_centers`: centros de custo.
- `project_schedules`: cronograma físico-financeiro.
- `project_schedule_milestones`: marcos e entregáveis.
- `project_measurements`: medições.
- `project_measurement_items`: itens medidos.
- `site_diary_entries`: diário de obra.
- `site_diary_labor`: mão de obra registrada no diário.
- `site_diary_equipment`: equipamentos usados no diário.
- `site_diary_occurrences`: ocorrências, impedimentos e registros de segurança.
- `project_photos`: fotos.
- `project_checklists`: checklists.

## Orçamentos

- `budgets`: orçamento principal.
- `budget_versions`: versionamento.
- `budget_items`: itens.
- `budget_compositions`: composições.
- `budget_bdi`: parâmetros de BDI.
- `budget_reference_sources`: fontes SINAPI, SEOP, TCPO e composições próprias.
- `budget_reference_items`: itens de referência importados ou cadastrados.
- `budget_documents`: PDFs e anexos gerados.

## Financeiro

- `accounts_payable`: contas a pagar.
- `accounts_receivable`: contas a receber.
- `cash_flow_entries`: fluxo de caixa.
- `payment_methods`: meios de pagamento.
- `financial_approvals`: aprovações financeiras.
- `financial_categories`: categorias gerenciais.

## Equipamentos

- `equipment_assets`: máquinas, ferramentas e equipamentos próprios.
- `equipment_allocations`: alocação por obra, período e responsável.
- `equipment_maintenance_orders`: manutenção preventiva/corretiva.
- `equipment_rental_contracts`: contratos de locação.

## RH, Equipes e Segurança do Trabalho

- `employees`: funcionários.
- `teams`: equipes.
- `team_members`: vínculo entre equipes e funcionários.
- `employee_documents`: documentos trabalhistas.
- `ppe_items`: catálogo de EPIs.
- `ppe_assignments`: entrega e validade de EPIs.
- `safety_trainings`: treinamentos obrigatórios.
- `safety_inspections`: inspeções de segurança.
- `safety_incidents`: incidentes e ações corretivas.
- `work_permits`: APR, PT e permissões de trabalho.

## Gestão documental

- `document_folders`: estrutura de pastas por obra, cliente, fornecedor ou contrato.
- `documents`: metadados de arquivos no Storage.
- `document_versions`: versões de documentos.
- `document_access_logs`: trilha de acesso.
- `legal_art_records`: ARTs e responsáveis técnicos.
- `contracts`: contratos e aditivos.
- `invoice_documents`: notas fiscais e anexos fiscais.

## BI/Dashboard

- `analytics_snapshots`: snapshots para indicadores.
- `dashboard_widgets`: widgets configuráveis.
- `dashboard_saved_views`: visões salvas por usuário/perfil.

## Padrões obrigatórios

- Tabelas transacionais devem ter `organization_id`.
- Entidades críticas devem ter `created_at`, `updated_at`, `created_by` e `updated_by` quando aplicável.
- Valores financeiros devem usar `numeric(14,2)`.
- Documentos ficam no Storage; o banco armazena metadados, dono, validade e classificação.
- Exclusão física deve ser evitada em entidades auditáveis; usar `deleted_at` quando necessário.
- RLS deve negar por padrão e liberar acesso por políticas explícitas.
