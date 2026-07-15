# Roadmap por versões — SION ERP

Este roadmap substitui a divisão genérica por fases e organiza a entrega em versões incrementais. Nenhuma funcionalidade deve ser implementada antes da aprovação da arquitetura definitiva.

## v0.1 Fundação

- Aprovar arquitetura definitiva.
- Criar app React + TypeScript + Vite.
- Configurar Tailwind CSS, tema claro/escuro, ESLint, typecheck e testes.
- Configurar Supabase Auth, perfis, roles, permissões e RLS base.
- Criar layout autenticado e estrutura de navegação.
- Configurar CI/CD, ambientes, deploy preview, auditoria inicial, logs e backup.

## v0.2 CRM

- Clientes e contatos.
- Pipeline comercial.
- Histórico e follow-up.
- Agenda comercial.
- Testes de permissões, formulários e RLS.

## v0.3 Fornecedores, Gestão Documental e Estoque inicial

- Cadastro de fornecedores.
- Homologação.
- Upload e validade de documentos.
- Gestão documental inicial para ART, contratos e notas fiscais.
- Estoque inicial para cadastro de materiais e almoxarifados.
- Avaliação, pesquisa e histórico.
- Auditoria de documentos sensíveis.

## v0.4 Compras, Cotações e Estoque

- Solicitação de compra.
- Cotação.
- Aprovação por alçada.
- Pedido de compra.
- Recebimento.
- Integração com fornecedores, obras, estoque e financeiro.
- Movimentações de estoque por compra, recebimento e consumo.

## v0.5 Gestão de Obras, Diário, Cronograma, Medições e Equipamentos

- Cadastro de obras.
- Cronograma físico-financeiro.
- Medições.
- Diário de obra.
- Fotos.
- Checklist.
- Equipamentos, locações, manutenção e apropriação por obra.
- Vínculo com equipes, segurança do trabalho, estoque, compras, orçamento e financeiro.

## v0.6 Orçamentos

- Composições.
- BDI.
- Cronograma.
- PDF.
- Histórico e versionamento.
- Aprovação e conversão para obra.

## v0.7 Financeiro

- Contas a pagar.
- Contas a receber.
- Fluxo de caixa.
- Relatórios financeiros.
- Aprovações, alçadas e auditoria reforçada.

## v0.8 BI/Dashboard

- Indicadores executivos.
- Obras em andamento.
- Propostas.
- Clientes.
- Fluxo financeiro.
- Estoque, equipamentos, segurança do trabalho e produtividade.
- Visões por permissão.

## v1.0 Produção

- Hardening de segurança.
- Teste completo de backup e restore.
- Observabilidade e alertas.
- Revisão LGPD.
- Documentação de operação.
- Treinamento de usuários.
- Go-live assistido.
