-- Fluxo de pregadores parceiros + destaque pago na Home
-- Rode no SQL Editor do Supabase.

-- Nível de confiança por parceiro: publica sem aprovação
alter table preachers add column if not exists auto_publish boolean not null default false;

-- Destaque pago na Home (controlado apenas pelo admin)
alter table studies add column if not exists is_featured boolean not null default false;
alter table studies add column if not exists featured_until timestamptz;

-- (já criado anteriormente, mantido por idempotência)
alter table studies add column if not exists cover_url text;
