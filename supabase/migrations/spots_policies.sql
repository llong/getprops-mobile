s-- Enable RLS
ALTER TABLE spots ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can create spots" ON spots;
    DROP POLICY IF EXISTS "Spots are viewable by everyone" ON spots;
    DROP POLICY IF EXISTS "Users can update their own spots" ON spots;
    DROP POLICY IF EXISTS "Users can delete their own spots" ON spots;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Create policy to allow authenticated users to insert spots
CREATE POLICY "Users can create spots"
ON spots FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Create policy to allow users to view all spots
CREATE POLICY "Spots are viewable by everyone"
ON spots FOR SELECT
TO authenticated
USING (true);

-- Create policy to allow users to update their own spots
CREATE POLICY "Users can update their own spots"
ON spots FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

-- Create policy to allow users to delete their own spots
CREATE POLICY "Users can delete their own spots"
ON spots FOR DELETE
TO authenticated
USING (auth.uid() = created_by); 