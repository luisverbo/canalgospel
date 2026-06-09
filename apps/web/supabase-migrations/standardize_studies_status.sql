-- 1. Remover check constraint antiga de status (se existir)
ALTER TABLE studies DROP CONSTRAINT IF EXISTS studies_status_check;

-- 2. Migrar registros com status antigo
UPDATE studies SET status = 'pending' WHERE status = 'pending_review';

-- 3. Adicionar nova check constraint com os 4 valores corretos
ALTER TABLE studies ADD CONSTRAINT studies_status_check
  CHECK (status IN ('draft', 'pending', 'published', 'rejected'));

-- 4. Garantir que preacher_id permite null (para importação sem pregador)
ALTER TABLE studies ALTER COLUMN preacher_id DROP NOT NULL;

-- 5. Garantir que body permite null
ALTER TABLE studies ALTER COLUMN body DROP NOT NULL;

-- Verificar resultado
SELECT status, count(*) FROM studies GROUP BY status ORDER BY status;
