-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Spot media is publicly accessible" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload spot media" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update their own spot media" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete their own spot media" ON storage.objects;
EXCEPTION
    WHEN undefined_object THEN 
        NULL;
END $$;

-- Create spots bucket for media
INSERT INTO storage.buckets (id, name, public)
VALUES ('spots', 'spots', true)
ON CONFLICT DO NOTHING;

-- Create policies for spot media storage
CREATE POLICY "Spot media is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'spots');

CREATE POLICY "Authenticated users can upload spot media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'spots'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own spot media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'spots'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own spot media"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'spots'
    AND (storage.foldername(name))[1] = auth.uid()::text
); 