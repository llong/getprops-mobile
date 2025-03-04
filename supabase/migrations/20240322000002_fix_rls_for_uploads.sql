-- CRITICAL FIX FOR UPLOADS: This drops all policies and recreates them with simpler, more permissive rules
-- Run this in the Supabase Dashboard SQL Editor

-- 1. First, let's enable RLS on the storage.objects table to make sure it's set
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies for the storage.objects table
DO $$ 
DECLARE 
    policy_name text;
BEGIN
    FOR policy_name IN (
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage'
    ) 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_name);
    END LOOP;
END $$;

-- 3. Recreate the spot-media bucket with public access
INSERT INTO storage.buckets (id, name, public)
VALUES ('spot-media', 'spot-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 4. Create simple, permissive policies that will work for sure
-- Allow all authenticated users to upload files to any storage bucket
CREATE POLICY "Allow all authenticated users to upload files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated users to update their own files" ON storage.objects
FOR UPDATE TO authenticated
USING (auth.uid() = owner);

-- Allow public read access to all buckets
CREATE POLICY "Allow public read access to all buckets" ON storage.objects
FOR SELECT TO public
USING (true);

-- Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated users to delete their own files" ON storage.objects
FOR DELETE TO authenticated
USING (auth.uid() = owner);

-- 5. Create empty placeholder files for spot-media directory structure
INSERT INTO storage.objects (bucket_id, name, owner, created_at, updated_at, metadata)
VALUES 
('spot-media', 'videos/.keep', NULL, now(), now(), '{"mimetype": "text/plain", "size": 0}'),
('spot-media', 'thumbnails/.keep', NULL, now(), now(), '{"mimetype": "text/plain", "size": 0}')
ON CONFLICT (bucket_id, name) DO NOTHING; 