ALTER TABLE campaigns ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE campaigns ADD COLUMN master_notes TEXT;
