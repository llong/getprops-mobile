-- Update spot table field names
ALTER TABLE spots RENAME COLUMN spot_type TO "spotType";
ALTER TABLE spots RENAME COLUMN is_lit TO "isLit";
ALTER TABLE spots RENAME COLUMN kickout_risk TO "kickoutRisk";
ALTER TABLE spots RENAME COLUMN created_by TO "createdBy";
ALTER TABLE spots RENAME COLUMN created_at TO "createdAt";
ALTER TABLE spots RENAME COLUMN updated_at TO "updatedAt";

-- Update spot_media table field names
ALTER TABLE spot_media RENAME COLUMN spot_id TO "spotId";
ALTER TABLE spot_media RENAME COLUMN user_id TO "userId";
ALTER TABLE spot_media RENAME COLUMN created_at TO "createdAt";

-- Update spot_videos table field names
ALTER TABLE spot_videos RENAME COLUMN spot_id TO "spotId";
ALTER TABLE spot_videos RENAME COLUMN user_id TO "userId";
ALTER TABLE spot_videos RENAME COLUMN thumbnail_url TO "thumbnailUrl";
ALTER TABLE spot_videos RENAME COLUMN created_at TO "createdAt";

-- Update profiles table field names
ALTER TABLE profiles RENAME COLUMN avatar_url TO "avatarUrl";
ALTER TABLE profiles RENAME COLUMN rider_type TO "riderType";
ALTER TABLE profiles RENAME COLUMN instagram_handle TO "instagramHandle";
ALTER TABLE profiles RENAME COLUMN spots_contributed TO "spotsContributed";
ALTER TABLE profiles RENAME COLUMN liked_spots TO "likedSpots";
ALTER TABLE profiles RENAME COLUMN disliked_spots TO "dislikedSpots";
ALTER TABLE profiles RENAME COLUMN created_at TO "createdAt";
ALTER TABLE profiles RENAME COLUMN updated_at TO "updatedAt"; 