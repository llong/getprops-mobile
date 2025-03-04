-- Create the spot-media storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('spot-media', 'spot-media', true)
ON CONFLICT (id) DO NOTHING;

-- IMPORTANT: Drop existing policies that might be causing conflicts
DROP POLICY IF EXISTS "Allow authenticated users to upload media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their own media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own media" ON storage.objects;

-- Allow any authenticated user to upload files to the spot-media bucket
CREATE POLICY "Allow authenticated users to upload media" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'spot-media');

-- Allow any authenticated user to update their own uploaded files
CREATE POLICY "Allow authenticated users to update their own media" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'spot-media' AND owner = auth.uid());

-- Allow anyone to download/view files (since they're public)
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'spot-media');

-- Allow authenticated users to delete only their own files
CREATE POLICY "Allow authenticated users to delete their own media" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'spot-media' AND owner = auth.uid());

-- Create empty files to establish folder structure in the bucket
-- (This is a common technique since object storage doesn't have real folders)
INSERT INTO storage.objects (bucket_id, name, owner, created_at, updated_at, metadata)
VALUES 
('spot-media', 'videos/.keep', 'system', now(), now(), '{"mimetype": "text/plain", "size": 0}'),
('spot-media', 'thumbnails/.keep', 'system', now(), now(), '{"mimetype": "text/plain", "size": 0}')
ON CONFLICT (bucket_id, name) DO NOTHING; 