export enum SpotStatus {
    Active = "active",
    Flagged = "flagged",
    Removed = "removed",
}

export type RiderType = 'inline' | 'skateboard' | 'bmx' | 'scooter';

export type SpotType = 'rail' | 'ledge' | 'gap' | 'wall_ride' | 'skatepark' | 'manual_pad';

export enum DifficultyLevel {
    Beginner = "beginner",
    Intermediate = "intermediate",
    Advanced = "advanced",
}

export interface UserProfile {
    id: string;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    city: string | null;
    country: string | null;
    riderType: RiderType | null;
    bio: string | null;
    instagramHandle: string | null;
    followerCount?: number;
    followingCount?: number;
    role?: 'admin' | 'moderator' | 'user';
    isBanned?: boolean;
    updatedAt?: string;
    createdAt?: string;
}

export interface Spot {
    id: string;
    name: string;
    description: string;
    created_by?: string;
    creator?: {
        username: string | null;
        avatarUrl: string | null;
        displayName: string | null;
    };
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    is_lit?: boolean;
    kickout_risk?: number;
    latitude: number;
    longitude: number;
    location?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    status?: string;
    created_at?: string;
    updated_at?: string;
    types?: string[];
    spot_type?: SpotType[];
    postalCode?: string;
    videoUrl?: string;
    photoUrl?: string;
    upvotes?: number;
    downvotes?: number;
    favoriteCount?: number;
    commentCount?: number;
    flagCount?: number;
    isFavorited?: boolean;
    favoritedBy?: string[];
    favoritedByUsers?: {
        id: string;
        username: string | null;
        avatarUrl: string | null;
    }[];
    thumbnail_small_url?: string;
    thumbnail_large_url?: string;
    media?: MediaItem[];
}

export interface MediaItem {
    id: string;
    url: string;
    thumbnailUrl?: string;
    type: 'photo' | 'video';
    createdAt: string;
    author: {
        id: string;
        username: string | null;
        avatarUrl: string | null;
    };
    likeCount: number;
    commentCount?: number;
    isLiked: boolean;
}

export interface FeedItem {
    media_id: string;
    spot_id: string;
    uploader_id: string;
    media_url: string;
    thumbnail_url?: string;
    media_type: 'photo' | 'video';
    created_at: string;
    spot_name: string;
    city?: string;
    country?: string;
    uploader_username: string | null;
    uploader_display_name: string | null;
    uploader_avatar_url: string | null;
    is_followed_by_user: boolean;
    like_count: number;
    comment_count: number;
    popularity_score: number;
    is_liked_by_user?: boolean;
    is_favorited_by_user?: boolean;
    favorite_count?: number;
}

export interface VideoAsset {
    id?: string;
    file?: any; 
    uri: string;
    width: number;
    height: number;
    duration: number;
    filename: string;
    mediaType: string;
    creationTime: number;
    modificationTime: number;
    assetId: string;
    fileSize: number;
    localUri: string;
    thumbnail?: string;
}

export interface PhotoMetadata {
    width: number;
    height: number;
    takenAt?: string;
    location?: {
        latitude: number;
        longitude: number;
    };
}

export interface PhotoUploadResult {
    originalUrl: string;
    thumbnailSmallUrl: string;
    thumbnailLargeUrl: string;
    metadata: PhotoMetadata;
}

export interface SpotFilters {
    difficulty?: string;
    kickout_risk?: number; // Filter for <= risk
    is_lit?: boolean;
    spot_type?: string[];
}

export type SpotFlagReason =
    | 'inappropriate_content'
    | 'incorrect_information'
    | 'spot_no_longer_exists'
    | 'duplicate_spot'
    | 'other';

export const SPOT_FLAG_REASONS: Record<SpotFlagReason, string> = {
    inappropriate_content: 'Inappropriate Content',
    incorrect_information: 'Incorrect Information',
    spot_no_longer_exists: 'Spot No Longer Exists',
    duplicate_spot: 'Duplicate Spot',
    other: 'Other',
};

export interface ContentReport {
    id: string;
    user_id: string;
    target_id: string;
    target_type: 'spot' | 'comment' | 'media';
    reason: string;
    details?: string;
    created_at: string;
    reporter?: {
        username: string | null;
        avatarUrl: string | null;
    };
    target_content?: any; // To store a preview of the reported content
    context_id?: string | null; // ID of the spot for context
}

export interface MediaLike {
    id: string;
    user_id: string;
    photo_id?: string;
    video_id?: string;
    media_type: 'photo' | 'video';
    created_at: string;
}

export interface MediaComment {
    id: string;
    user_id: string;
    photo_id?: string;
    video_id?: string;
    parent_id?: string | null;
    media_type: 'photo' | 'video';
    content: string;
    created_at: string;
    updated_at: string;
    author?: {
        username: string | null;
        avatarUrl: string | null;
    };
    reactions?: {
        likes: number;
        dislikes?: number; // Add dislikes for full parity
        userReaction: 'like' | 'dislike' | null;
    };
    replies?: MediaComment[]; // For nested replies
}

export interface LikedMediaItem {
    id: string;
    mediaId: string;
    url: string;
    thumbnailUrl?: string;
    type: 'photo' | 'video';
    spot: {
        id: string;
        name: string;
    };
    author: {
        id: string;
        username: string | null;
        avatarUrl: string | null;
    };
}

export interface UserMediaItem {
    id: string;
    url: string;
    thumbnailUrl?: string;
    type: 'photo' | 'video';
    created_at: string;
    spot: {
        id: string;
        name: string;
        city?: string;
        country?: string;
    };
}

export interface SpotComment {
    id: string;
    spot_id: string;
    user_id: string;
    parent_id: string | null;
    content: string;
    is_edited: boolean;
    created_at: string;
    updated_at: string;
    author?: {
        username: string | null;
        avatarUrl: string | null;
    };
    replies?: SpotComment[];
    reactions?: {
        likes: number;
        dislikes: number;
        userReaction: 'like' | 'dislike' | null;
    };
}

export interface AppNotification {
    id: string;
    user_id: string;
    actor_id: string;
    type: 'reply' | 'like_spot' | 'like_media' | 'follow' | 'comment';
    entity_id: string;
    entity_type: 'comment' | 'spot' | 'media' | 'profile';
    is_read: boolean;
    created_at: string;
    actor?: {
        username: string | null;
        avatarUrl: string | null;
    };
}

export interface ConversationParticipant {
    id: string;
    user_id: string;
    role: 'admin' | 'member';
    status: 'pending' | 'accepted' | 'rejected';
    joined_at: string;
    profile?: UserProfile;
}

export interface ChatMessage {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
    author?: {
        username: string;
        avatarUrl: string | null;
    };
}

export interface Conversation {
    id: string;
    name: string | null;
    is_group: boolean;
    created_by: string;
    created_at: string;
    last_message_at: string;
    participants: ConversationParticipant[];
    lastMessage?: ChatMessage;
    unreadCount: number;
}