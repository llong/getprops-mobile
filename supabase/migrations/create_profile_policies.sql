-- Enable RLS if not already enabled
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create spot type enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'spot_type_enum') THEN
        CREATE TYPE spot_type_enum AS ENUM (
            'rail',
            'ledge',
            'gap',
            'wall_ride',
            'skatepark',
            'manual_pad'
        );
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create media type enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_type_enum') THEN
        CREATE TYPE media_type_enum AS ENUM ('photo', 'video');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    -- Profile policies
    DROP POLICY IF EXISTS "Users can view any profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
    DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
    DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
    
    -- Spot media policies
    DROP POLICY IF EXISTS "Users can view any spot media" ON spot_media;
    DROP POLICY IF EXISTS "Users can insert their own media" ON spot_media;
    DROP POLICY IF EXISTS "Users can delete their own media" ON spot_media;
    
    -- Storage policies
    DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
    DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
EXCEPTION
    WHEN undefined_object THEN 
        NULL;
END $$;

-- Create simplified profile policies
CREATE POLICY "Enable read access for all users"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Enable update for users based on id"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only"
ON profiles FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Update NULL usernames with a temporary value
UPDATE profiles 
SET username = 'user_' || id
WHERE username IS NULL;

-- Add NOT NULL constraint
ALTER TABLE profiles 
ALTER COLUMN username SET NOT NULL;

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_username'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT unique_username UNIQUE (username);
    END IF;
EXCEPTION
    WHEN duplicate_table THEN 
        NULL;
END $$;

-- Update spots table to use enum array
DO $$ 
BEGIN
    -- First, create a temporary column with the new type
    ALTER TABLE spots ADD COLUMN IF NOT EXISTS spot_types spot_type_enum[] DEFAULT '{}';
    
    -- Convert existing data if spot_type column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'spots' AND column_name = 'spot_type') THEN
        -- Convert text to enum array
        UPDATE spots 
        SET spot_types = ARRAY[spot_type]::spot_type_enum[];
        
        -- Drop the old column
        ALTER TABLE spots DROP COLUMN IF EXISTS spot_type;
    END IF;
    
    -- Rename the new column if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'spots' AND column_name = 'spot_types') THEN
        ALTER TABLE spots RENAME COLUMN spot_types TO spot_type;
    END IF;
END $$;

-- Update spot_media table to use enum
DO $$ 
BEGIN
    -- First, create a temporary column with the new type
    ALTER TABLE spot_media ADD COLUMN IF NOT EXISTS media_type media_type_enum;
    
    -- Convert existing data if type column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'spot_media' AND column_name = 'type') THEN
        UPDATE spot_media 
        SET media_type = type::media_type_enum;
        
        -- Drop the old column
        ALTER TABLE spot_media DROP COLUMN IF EXISTS type;
    END IF;
    
    -- Rename the new column if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'spot_media' AND column_name = 'media_type') THEN
        ALTER TABLE spot_media RENAME COLUMN media_type TO type;
    END IF;
END $$; 