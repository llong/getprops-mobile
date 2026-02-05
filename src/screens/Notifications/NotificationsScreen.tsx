import React, { useCallback } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, Avatar, Icon, useTheme, ListItem } from '@rneui/themed';
import { useNotificationsQuery } from '@/hooks/useProfileQueries';
import { formatDistanceToNow } from 'date-fns';
import { useNavigation } from '@react-navigation/native';

export const NotificationsScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation() as any;
    // We need the user ID for notifications
    const { data: notifications, isLoading, refetch } = useNotificationsQuery('me'); // 'me' is a placeholder if handled by hook, but usually we need actual ID

    const renderItem = ({ item }: { item: any }) => {
        const getIcon = () => {
            switch (item.type) {
                case 'like_media':
                case 'like_spot':
                    return { name: 'favorite', color: theme.colors.error };
                case 'comment':
                case 'reply':
                    return { name: 'chat-bubble', color: theme.colors.primary };
                case 'follow':
                    return { name: 'person-add', color: theme.colors.success };
                default:
                    return { name: 'notifications', color: theme.colors.grey3 };
            }
        };

        const icon = getIcon();

        return (
            <ListItem 
                bottomDivider
                onPress={() => {
                    if (item.entity_type === 'spot') {
                        navigation.navigate('SpotStack', { screen: 'SpotDetails', params: { spotId: item.entity_id } });
                    } else if (item.entity_type === 'profile') {
                        navigation.navigate('ProfileStack', { screen: 'UserProfile', params: { userId: item.entity_id } });
                    }
                }}
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
                    </ListItem.Title>
                    <ListItem.Subtitle style={styles.timestamp}>
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </ListItem.Subtitle>
                </ListItem.Content>
                <Icon name={icon.name} color={icon.color} size={20} />
            </ListItem>
        );
    };

    if (isLoading && (!notifications || notifications.length === 0)) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                onRefresh={refetch}
                refreshing={isLoading}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="notifications-none" size={64} color={theme.colors.grey4} />
                        <Text style={styles.emptyText}>No notifications yet.</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
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