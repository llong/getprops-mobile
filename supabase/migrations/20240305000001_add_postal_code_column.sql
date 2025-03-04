-- Add postal_code column to spots table
ALTER TABLE spots ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- Comment on the column
COMMENT ON COLUMN spots.postal_code IS 'The postal code of the spot location'; 