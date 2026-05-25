-- Migration 111: cor por dentista para identificação visual na agenda
ALTER TABLE dentistas
  ADD COLUMN IF NOT EXISTS cor VARCHAR(20) DEFAULT '#6366f1';

-- Cores dos dentistas do Instituto Belém
UPDATE dentistas SET cor = '#3b82f6' WHERE nome ILIKE '%Brenna%';    -- azul
UPDATE dentistas SET cor = '#f43f5e' WHERE nome ILIKE '%Eduarda%';   -- rose
UPDATE dentistas SET cor = '#10b981' WHERE nome ILIKE '%Vin%cius%';  -- emerald
