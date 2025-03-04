ALTER TABLE spots
ADD COLUMN media jsonb DEFAULT '[]'::jsonb,
ADD COLUMN thumbnail_url text,
ADD COLUMN upvotes integer DEFAULT 0,
ADD COLUMN downvotes integer DEFAULT 0,
ADD COLUMN flag_count integer DEFAULT 0,
ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'flagged', 'removed'));

-- Create a function to check if a spot should be auto-flagged
CREATE OR REPLACE FUNCTION check_spot_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.downvotes > 0 AND (NEW.downvotes::float / NULLIF(NEW.upvotes, 0)) >= 2 THEN
    NEW.status := 'flagged';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-flag spots
CREATE TRIGGER spot_status_trigger
BEFORE UPDATE ON spots
FOR EACH ROW
EXECUTE FUNCTION check_spot_status(); 