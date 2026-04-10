create extension if not exists pgcrypto;

create table if not exists public.leads (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  email text not null,
  phone text,
  source text not null,
  status text not null check (status in ('prospect', 'contato', 'proposta', 'fechado', 'perdido')),
  value numeric(12, 2),
  notes text,
  created_at date not null default current_date,
  updated_at date not null default current_date
);

create table if not exists public.services (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  description text not null,
  category text not null,
  base_price numeric(12, 2) not null,
  estimated_hours integer not null,
  includes text[] not null default '{}',
  active boolean not null default true
);

create table if not exists public.contracts (
  id text primary key default gen_random_uuid()::text,
  client_name text not null,
  service_name text not null,
  status text not null check (status in ('em_andamento', 'revisao', 'entregue', 'cancelado')),
  value numeric(12, 2) not null,
  start_date date not null,
  deadline date not null,
  delivered_date date,
  notes text
);

create table if not exists public.costs (
  id text primary key default gen_random_uuid()::text,
  description text not null,
  type text not null check (type in ('fixo', 'variavel')),
  amount numeric(12, 2) not null,
  category text not null,
  date date not null,
  recurring boolean not null default false
);

create table if not exists public.revenues (
  id text primary key default gen_random_uuid()::text,
  description text not null,
  amount numeric(12, 2) not null,
  contract_id text references public.contracts(id) on delete set null,
  date date not null
);

create table if not exists public.alerts (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  description text not null,
  module text not null check (module in ('captacao', 'servicos', 'contratos', 'custos')),
  urgency text not null check (urgency in ('alta', 'media', 'baixa')),
  resolved boolean not null default false,
  created_at date not null default current_date,
  due_date date
);

create table if not exists public.process_nodes (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  description text not null,
  steps text[] not null default '{}',
  x double precision not null,
  y double precision not null,
  parent_id text references public.process_nodes(id) on delete cascade,
  color text,
  sort_order integer not null default 0
);

alter table public.leads enable row level security;
alter table public.services enable row level security;
alter table public.contracts enable row level security;
alter table public.costs enable row level security;
alter table public.revenues enable row level security;
alter table public.alerts enable row level security;
alter table public.process_nodes enable row level security;

drop policy if exists "Allow anon full access to leads" on public.leads;
create policy "Allow anon full access to leads" on public.leads for all using (true) with check (true);

drop policy if exists "Allow anon full access to services" on public.services;
create policy "Allow anon full access to services" on public.services for all using (true) with check (true);

drop policy if exists "Allow anon full access to contracts" on public.contracts;
create policy "Allow anon full access to contracts" on public.contracts for all using (true) with check (true);

drop policy if exists "Allow anon full access to costs" on public.costs;
create policy "Allow anon full access to costs" on public.costs for all using (true) with check (true);

drop policy if exists "Allow anon full access to revenues" on public.revenues;
create policy "Allow anon full access to revenues" on public.revenues for all using (true) with check (true);

drop policy if exists "Allow anon full access to alerts" on public.alerts;
create policy "Allow anon full access to alerts" on public.alerts for all using (true) with check (true);

drop policy if exists "Allow anon full access to process_nodes" on public.process_nodes;
create policy "Allow anon full access to process_nodes" on public.process_nodes for all using (true) with check (true);

insert into public.leads (id, name, email, source, status, value, created_at, updated_at, notes)
values
  ('1', 'João Silva', 'joao@email.com', 'Instagram', 'proposta', 3500, '2026-03-15', '2026-04-01', 'Interessado em landing page'),
  ('2', 'Maria Santos', 'maria@empresa.com', 'Indicação', 'contato', 8000, '2026-04-02', '2026-04-05', null),
  ('3', 'Tech Corp', 'contato@tech.com', 'Google', 'fechado', 12000, '2026-02-20', '2026-03-10', null),
  ('4', 'Ana Costa', 'ana@startup.io', 'LinkedIn', 'prospect', null, '2026-04-08', '2026-04-08', null)
on conflict (id) do nothing;

insert into public.services (id, name, description, category, base_price, estimated_hours, includes, active)
values
  ('1', 'Landing Page', 'Página única de conversão', 'Web', 2500, 20, array['Design responsivo', 'SEO básico', 'Formulário de contato'], true),
  ('2', 'Site Institucional', 'Site completo com múltiplas páginas', 'Web', 5000, 40, array['Até 5 páginas', 'Blog', 'Painel admin', 'SEO'], true),
  ('3', 'E-commerce', 'Loja virtual completa', 'Web', 12000, 80, array['Catálogo', 'Carrinho', 'Pagamento', 'Painel admin'], true),
  ('4', 'Redesign', 'Reformulação visual de site existente', 'Design', 3500, 30, array['Análise UX', 'Novo layout', 'Migração'], true)
on conflict (id) do nothing;

insert into public.contracts (id, client_name, service_name, status, value, start_date, deadline)
values
  ('1', 'Tech Corp', 'Site Institucional', 'em_andamento', 12000, '2026-03-15', '2026-04-30'),
  ('2', 'Café Aurora', 'Landing Page', 'revisao', 2500, '2026-03-01', '2026-04-10'),
  ('3', 'Loja Bella', 'E-commerce', 'em_andamento', 15000, '2026-04-01', '2026-06-15')
on conflict (id) do nothing;

insert into public.costs (id, description, type, amount, category, date, recurring)
values
  ('1', 'Hosting e Domínios', 'fixo', 150, 'Infraestrutura', '2026-04-01', true),
  ('2', 'Ferramentas de Design (Figma)', 'fixo', 75, 'Ferramentas', '2026-04-01', true),
  ('3', 'Freela - Dev Frontend', 'variavel', 2000, 'Equipe', '2026-03-20', false)
on conflict (id) do nothing;

insert into public.revenues (id, description, amount, contract_id, date)
values
  ('1', 'Tech Corp - Entrada 50%', 6000, '1', '2026-03-15'),
  ('2', 'Café Aurora - Pagamento total', 2500, '2', '2026-03-01'),
  ('3', 'Loja Bella - Entrada 30%', 4500, '3', '2026-04-01')
on conflict (id) do nothing;

insert into public.alerts (id, title, description, module, urgency, resolved, created_at, due_date)
values
  ('1', 'Prazo próximo: Café Aurora', 'Deadline em 2 dias - projeto em revisão', 'contratos', 'alta', false, '2026-04-08', '2026-04-10'),
  ('2', 'Lead sem resposta: Maria Santos', 'Sem contato há 5 dias', 'captacao', 'media', false, '2026-04-05', null),
  ('3', 'Pagamento pendente: Tech Corp', '50% restante após entrega', 'custos', 'baixa', false, '2026-04-01', null)
on conflict (id) do nothing;

insert into public.process_nodes (id, title, description, steps, x, y, parent_id, color, sort_order)
values
  ('root', 'MAJE', 'Processo central da agência', array['Definir serviços', 'Montar portfólio', 'Criar presença digital'], 500, 300, null, 'primary', 0),
  ('captacao', 'Captação de Clientes', 'Como atrair e converter leads', array['Definir canais (Instagram, Google, Indicação)', 'Criar conteúdo de atração', 'Configurar funil de vendas', 'Follow-up com leads'], 200, 120, 'root', 'primary', 1),
  ('proposta', 'Proposta & Briefing', 'Do primeiro contato ao fechamento', array['Reunião de briefing', 'Análise de necessidades', 'Elaborar proposta comercial', 'Negociação e ajustes', 'Assinatura do contrato'], 800, 120, 'root', 'primary', 2),
  ('producao', 'Produção', 'Execução do projeto', array['Wireframe e prototipagem', 'Aprovação do layout', 'Desenvolvimento front-end', 'Integração de conteúdo', 'Testes e QA'], 200, 480, 'root', 'primary', 3),
  ('entrega', 'Entrega & Pós-venda', 'Finalização e relacionamento', array['Apresentação final ao cliente', 'Ajustes pós-aprovação', 'Deploy e go-live', 'Treinamento do cliente', 'Suporte pós-entrega'], 800, 480, 'root', 'primary', 4)
on conflict (id) do nothing;
