-- Fluxo de pregadores parceiros + destaque pago na Home
-- Rode no SQL Editor do Supabase.

-- Nível de confiança por parceiro: publica sem aprovação
alter table preachers add column if not exists auto_publish boolean not null default false;

-- Destaque pago na Home (controlado apenas pelo admin)
alter table studies add column if not exists is_featured boolean not null default false;
alter table studies add column if not exists featured_until timestamptz;

-- (já criado anteriormente, mantido por idempotência)
alter table studies add column if not exists cover_url text;

-- Métrica de leituras/visualizações por estudo
alter table studies add column if not exists view_count integer not null default 0;

-- Incremento de leitura seguro (anon só lê published via RLS; aqui usamos SECURITY DEFINER)
create or replace function increment_study_view(p_study_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update studies set view_count = view_count + 1
  where id = p_study_id and status = 'published';
$$;
grant execute on function increment_study_view(uuid) to anon, authenticated;

-- Papel do parceiro: o projeto usa role='partner' (valor já existente no schema).
-- Cadastro, middleware, guards e login usam todos 'partner' — nenhuma ação extra.
