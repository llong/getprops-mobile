import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, Avatar, Icon, useTheme, ListItem, Button } from '@rneui/themed';
import { useNotificationsQuery } from '@/hooks/useProfileQueries';
import { formatDistanceToNow } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { useAtomValue } from 'jotai';
import { userAtom } from '@/state/auth';
import { supabase } from '@/utils/supabase';
import { useQueryClient } from '@tanstack/react-query';

export const NotificationsScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation() as any;
    const auth = useAtomValue(userAtom);
    const userId = auth?.user.id;
    const queryClient = useQueryClient();

    const { data: notifications, isLoading, refetch } = useNotificationsQuery(userId);

    const handleMarkAsRead = useCallback(async (notificationId: string) => {
        if (!userId) return;
        try {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId);
            queryClient.invalidateQueries({ queryKey: ['profile', 'notifications', userId] });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }, [userId, queryClient]);

    const handleMarkAllAsRead = useCallback(async () => {
        if (!userId) return;
        try {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', userId)
                .eq('is_read', false);
            queryClient.invalidateQueries({ queryKey: ['profile', 'notifications', userId] });
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }, [userId, queryClient]);

    const handleNotificationPress = useCallback(async (item: any) => {
        if (!userId) return; // Ensure user is logged in
        await handleMarkAsRead(item.id);

        if (item.type === 'new_message') {
            navigation.navigate('ChatStack', { screen: 'ChatRoom', params: { conversationId: item.context_id } });
        } else if (item.entity_type === 'spot') {
            navigation.navigate('SpotStack', { screen: 'SpotDetails', params: { spotId: item.entity_id } });
        } else if (item.entity_type === 'profile') {
            navigation.navigate('ProfileStack', { screen: 'UserProfile', params: { userId: item.entity_id } });
        }
        else if (item.entity_type === 'comment' || item.entity_type === 'media') {
            if (item.context_id) {
                navigation.navigate('SpotStack', { screen: 'SpotDetails', params: { spotId: item.context_id } });
            }
        }
    }, [userId, navigation, handleMarkAsRead]);

    const renderItem = ({ item }: { item: any }) => {
        const getIcon = () => {
            switch (item.type) {
                case 'like_media':
                case 'like_spot':
                    return { name: 'favorite', color: theme.colors.error, type: 'material' };
                case 'comment':
                case 'reply':
                    return { name: 'chat-bubble', color: theme.colors.primary, type: 'material' };
                case 'follow':
                    return { name: 'person-add', color: theme.colors.success, type: 'material' };
                case 'new_message':
                    return { name: 'mail', color: theme.colors.primary, type: 'material' };
                default:
                    return { name: 'notifications', color: theme.colors.grey3, type: 'material' };
            }
        };

        const icon = getIcon();

        return (
            <ListItem 
                bottomDivider
                containerStyle={item.is_read ? styles.readNotification : styles.unreadNotification}
                onPress={() => handleNotificationPress(item)}
            >
                <Avatar
                    rounded
                    source={item.actor?.avatarUrl ? { uri: item.actor.avatarUrl } : require('@assets/images/icon.png')}
                />
                <ListItem.Content>
                    <ListItem.Title style={styles.notificationText}>
                        <Text style={styles.actorName}>@{item.actor?.username || 'someone'}</Text>
                        {' '}
                        {item.type === 'like_media' && 'liked your photo/video'}
                        {item.type === 'like_spot' && 'favorited your spot'}
                        {item.type === 'comment' && 'commented on your spot'}
                        {item.type === 'reply' && 'replied to your comment'}
                        {item.type === 'follow' && 'started following you'}
                        {item.type === 'new_message' && 'sent you a new message'}
                    </ListItem.Title>
                    <ListItem.Subtitle style={styles.timestamp}>
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </ListItem.Subtitle>
                </ListItem.Content>
                <Icon name={icon.name} color={icon.color} size={20} type={icon.type} />
            </ListItem>
        );
    };

    const hasUnread = notifications?.some(n => !n.is_read);

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text h4 style={styles.headerTitle}>Alerts</Text>
                {hasUnread && (
                    <Button
                        title="Mark all as read"
                        type="clear"
                        onPress={handleMarkAllAsRead}
                        titleStyle={{ color: theme.colors.primary, fontSize: 13 }}
                    />
                )}
            </View>
            
            {isLoading && (!notifications || notifications.length === 0) ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    onRefresh={refetch}
                    refreshing={isLoading}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="notifications-none" size={64} color={theme.colors.grey4} type="material" />
                            <Text style={styles.emptyText}>No notifications yet.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eff3f4',
    },
    headerTitle: {
        fontWeight: '800',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    readNotification: {
        backgroundColor: '#fff',
    },
    unreadNotification: {
        backgroundColor: '#f0f2f5', // Slightly different background for unread
    },
    notificationText: {
        fontSize: 14,
        lineHeight: 18,
    },
    actorName: {
        fontWeight: '700',
    },
    timestamp: {
        fontSize: 12,
        color: '#536471',
        marginTop: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 16,
        color: '#86939e',
    },
});