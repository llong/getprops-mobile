-- This migration fixes the storage bucket permissions
-- It ensures we drop all existing policies that might be conflicting
-- and creates fresh policies for the spot-media bucket

-- Drop existing policies that might be causing conflicts
DROP POLICY IF EXISTS "Allow authenticated users to upload media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their own media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own media" ON storage.objects;

-- Old policies from spots bucket
DROP POLICY IF EXISTS "Spot media is publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload spot media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own spot media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own spot media" ON storage.objects;

-- Create the spot-media storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('spot-media', 'spot-media', true)
ON CONFLICT (id) DO NOTHING;

-- POLICY 1: Allow any authenticated user to upload files to the spot-media bucket
-- Fix: Use WITH CHECK instead of USING for INSERT policies
CREATE POLICY "Authenticated users can upload to spot-media" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'spot-media');

-- POLICY 2: Allow any authenticated user to update their own uploaded files
CREATE POLICY "Authenticated users can update their spot-media" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'spot-media' AND auth.uid() = owner);

-- POLICY 3: Allow anyone to download/view files (since they're public)
CREATE POLICY "Public can view spot-media" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'spot-media');

-- POLICY 4: Allow authenticated users to delete only their own files
CREATE POLICY "Authenticated users can delete their spot-media" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'spot-media' AND auth.uid() = owner);

-- Create empty files to establish folder structure in the bucket
INSERT INTO storage.objects (bucket_id, name, owner, created_at, updated_at, metadata)
VALUES 
('spot-media', 'videos/.keep', auth.uid(), now(), now(), '{"mimetype": "text/plain", "size": 0}'),
('spot-media', 'thumbnails/.keep', auth.uid(), now(), now(), '{"mimetype": "text/plain", "size": 0}')
ON CONFLICT (bucket_id, name) DO NOTHING; 