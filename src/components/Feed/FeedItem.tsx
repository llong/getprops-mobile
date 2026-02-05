import React, { memo, useState, useCallback } from 'react';
import { StyleSheet, View, TouchableOpacity, Share } from 'react-native';
import { Avatar, Text, Icon, useTheme, Button } from '@rneui/themed';
import { formatDistanceToNow } from 'date-fns';
import type { FeedItem as FeedItemType } from '@/types';
import { useToggleMediaLike, useToggleFollow } from '@/hooks/useFeedQueries';
import { useToggleFavoriteMutation } from '@/hooks/useSpotQueries';
import { MediaCarousel } from './MediaCarousel';
import { useNavigation } from '@react-navigation/native';

interface FeedItemProps {
    item: FeedItemType;
    currentUserId?: string;
    isVisible?: boolean;
}

export const FeedItem = memo(({ item, currentUserId, isVisible = true }: FeedItemProps) => {
    const { theme } = useTheme();
    const navigation = useNavigation() as any;
    const toggleLikeMutation = useToggleMediaLike();
    const toggleFollowMutation = useToggleFollow();
    const toggleFavoriteMutation = useToggleFavoriteMutation();

    const [isLiked, setIsLiked] = useState(!!item.is_liked_by_user);
    const [likeCount, setLikeCount] = useState(item.like_count);
    const [isFavorited, setIsFavorited] = useState(!!item.is_favorited_by_user);
    const [favoriteCount, setFavoriteCount] = useState(item.favorite_count || 0);

    const handleLike = useCallback(async () => {
        if (!currentUserId) return;
        
        const previousLiked = isLiked;
        const previousCount = likeCount;

        setIsLiked(!previousLiked);
        setLikeCount(prev => previousLiked ? prev - 1 : prev + 1);

        try {
            await toggleLikeMutation.mutateAsync({ 
                mediaId: item.media_id, 
                mediaType: item.media_type 
            });
        } catch (error) {
            setIsLiked(previousLiked);
            setLikeCount(previousCount);
        }
    }, [isLiked, likeCount, item.media_id, item.media_type, currentUserId]);

    const handleFavorite = useCallback(async () => {
        if (!currentUserId) return;

        const previousFavorited = isFavorited;
        const previousCount = favoriteCount;

        setIsFavorited(!previousFavorited);
        setFavoriteCount(prev => previousFavorited ? prev - 1 : prev + 1);

        try {
            await toggleFavoriteMutation.mutateAsync({
                spotId: item.spot_id,
                userId: currentUserId,
                isFavorited: previousFavorited
            });
        } catch (error) {
            setIsFavorited(previousFavorited);
            setFavoriteCount(previousCount);
        }
    }, [isFavorited, favoriteCount, item.spot_id, currentUserId]);

    const handleFollow = useCallback(async () => {
        if (!currentUserId) return;
        try {
            await toggleFollowMutation.mutateAsync(item.uploader_id);
        } catch (error) {
            console.error('Follow failed', error);
        }
    }, [item.uploader_id, currentUserId]);

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this spot on SpotHop: ${item.spot_name}`,
                url: `https://spothop.app/spots/${item.spot_id}`
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleProfilePress = () => {
        navigation.navigate('ProfileStack', { screen: 'UserProfile', params: { userId: item.uploader_id } });
    };

    const handleSpotPress = () => {
        navigation.navigate('SpotStack', { screen: 'SpotDetails', params: { spotId: item.spot_id } });
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.userInfo} onPress={handleProfilePress}>
                    <Avatar
                        rounded
                        size={40}
                        source={item.uploader_avatar_url ? { uri: item.uploader_avatar_url } : require('@assets/images/icon.png')}
                    />
                    <View style={styles.userText}>
                        <View style={styles.nameRow}>
                            <Text style={styles.displayName}>{item.uploader_display_name || item.uploader_username}</Text>
                            <Text style={styles.timestamp}>¬∑ {formatDistanceToNow(new Date(item.created_at), { addSuffix: false })}</Text>
                        </View>
                        <Text style={styles.username}>@{item.uploader_username}</Text>
                    </View>
                </TouchableOpacity>
                {currentUserId && currentUserId !== item.uploader_id && (
                    <Button
                        title={item.is_followed_by_user ? "Following" : "Follow"}
                        type={item.is_followed_by_user ? "outline" : "solid"}
                        size="sm"
                        buttonStyle={[
                            styles.followButton,
                            !item.is_followed_by_user && { backgroundColor: '#000' }
                        ]}
                        titleStyle={[
                            styles.followTitle,
                            item.is_followed_by_user ? { color: '#000' } : { color: '#fff' }
                        ]}
                        onPress={handleFollow}
                        loading={toggleFollowMutation.isPending}
                    />
                )}
            </View>

            {/* Content */}
            <TouchableOpacity style={styles.content} onPress={handleSpotPress}>
                <Text style={styles.spotText}>
                    Found a spot: <Text style={styles.spotName}>{item.spot_name}</Text>
                </Text>
                {item.city && (
                    <View style={styles.locationRow}>
                        <Icon name="location-on" size={14} color={theme.colors.grey3} />
                        <Text style={styles.locationText}>{item.city}, {item.country}</Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* Media */}
            <MediaCarousel 
                media={[{
                    id: item.media_id,
                    url: item.media_url,
                    type: item.media_type,
                    thumbnailUrl: item.thumbnail_url
                }]} 
                isVisible={isVisible}
            />

            {/* Actions */}
            <View style={styles.actions}>
                <View style={styles.actionGroup}>
                    <TouchableOpacity onPress={handleFavorite} style={styles.actionItem}>
                        <Icon 
                            name={isFavorited ? "favorite" : "favorite-border"} 
                            color={isFavorited ? theme.colors.error : theme.colors.grey3} 
                            size={24} 
                        />
                        <Text style={[styles.actionCount, isFavorited && { color: theme.colors.error }]}>
                            {favoriteCount}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionItem}>
                        <Icon name="chat-bubble-outline" color={theme.colors.grey3} size={22} />
                        <Text style={styles.actionCount}>{item.comment_count}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleShare} style={styles.actionItem}>
                        <Icon name="share" color={theme.colors.grey3} size={22} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eff3f4',
        paddingVertical: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginBottom: 10,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    userText: {
        marginLeft: 10,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    displayName: {
        fontWeight: '700',
        fontSize: 15,
    },
    timestamp: {
        color: '#536471',
        fontSize: 14,
        marginLeft: 4,
    },
    username: {
        color: '#536471',
        fontSize: 14,
    },
    followButton: {
        borderRadius: 20,
        paddingHorizontal: 15,
        height: 32,
        borderColor: '#cfd9de',
    },
    followTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    content: {
        paddingHorizontal: 15,
        marginBottom: 10,
    },
    spotText: {
        fontSize: 15,
        lineHeight: 20,
    },
    spotName: {
        fontWeight: '700',
        color: '#1d9bf0',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    locationText: {
        fontSize: 13,
        color: '#536471',
        marginLeft: 2,
    },
    actions: {
        paddingHorizontal: 15,
        paddingVertical: 5,
    },
    actionGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        maxWidth: '80%',
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    actionCount: {
        fontSize: 13,
        color: '#536471',
        marginLeft: 5,
    },
});