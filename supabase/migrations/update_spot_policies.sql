-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Authenticated users can insert spots" ON spots;
    DROP POLICY IF EXISTS "Spot creators can update their spots" ON spots;
    DROP POLICY IF EXISTS "Spots are viewable by everyone" ON spots;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Create spot policies
CREATE POLICY "Authenticated users can insert spots"
ON spots FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Spot creators can update their spots"
ON spots FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Spots are viewable by everyone"
ON spots FOR SELECT
TO public
USING (status != 'removed');

-- Create spot_media table and policies
CREATE TABLE IF NOT EXISTS spot_media (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    spot_id uuid REFERENCES spots(id) ON DELETE CASCADE,
    url text NOT NULL,
    type text CHECK (type IN ('image', 'video')),
    thumbnail_url text,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    CONSTRAINT fk_spot FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE spot_media ENABLE ROW LEVEL SECURITY;

-- Create spot media policies
CREATE POLICY "Spot media is viewable by everyone"
ON spot_media FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can insert spot media"
ON spot_media FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own spot media"
ON spot_media FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own spot media"
ON spot_media FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- Create spot votes table
CREATE TABLE IF NOT EXISTS spot_votes (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    spot_id uuid REFERENCES spots(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id),
    vote_type text CHECK (vote_type IN ('upvote', 'downvote')),
    created_at timestamptz DEFAULT now(),
    UNIQUE(spot_id, user_id)
);

-- Enable RLS
ALTER TABLE spot_votes ENABLE ROW LEVEL SECURITY;

-- Create spot votes policies
CREATE POLICY "Users can view all votes"
ON spot_votes FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can vote"
ON spot_votes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can change their votes"
ON spot_votes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their votes"
ON spot_votes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create function to update spot vote counts
CREATE OR REPLACE FUNCTION update_spot_votes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.vote_type = 'upvote' THEN
            UPDATE spots SET upvotes = upvotes + 1 WHERE id = NEW.spot_id;
        ELSE
            UPDATE spots SET downvotes = downvotes + 1 WHERE id = NEW.spot_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.vote_type = 'upvote' THEN
            UPDATE spots SET upvotes = upvotes - 1 WHERE id = OLD.spot_id;
        ELSE
            UPDATE spots SET downvotes = downvotes - 1 WHERE id = OLD.spot_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for vote counting
CREATE TRIGGER spot_votes_insert_trigger
AFTER INSERT ON spot_votes
FOR EACH ROW
EXECUTE FUNCTION update_spot_votes();

CREATE TRIGGER spot_votes_delete_trigger
AFTER DELETE ON spot_votes
FOR EACH ROW
EXECUTE FUNCTION update_spot_votes(); 