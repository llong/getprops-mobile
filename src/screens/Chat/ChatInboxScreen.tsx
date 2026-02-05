import React, { useState } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, Avatar, ListItem, Badge, Tab, Icon, useTheme, Button } from '@rneui/themed';
import { useConversationsQuery } from '@/hooks/useChatQueries';
import { useAtomValue } from 'jotai';
import { userAtom } from '@/state/auth';
import { formatDistanceToNow } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { chatService } from '@/services/chatService';
import { useQueryClient } from '@tanstack/react-query';

export const ChatInboxScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation() as any;
    const user = useAtomValue(userAtom);
    const queryClient = useQueryClient();
    const [tabIndex, setTabIndex] = useState(0);

    const { data: conversations, isLoading, refetch } = useConversationsQuery(user?.user.id);

    const activeChats = (conversations || []).filter(c =>
        c.participants.find(p => p.user_id === user?.user.id)?.status === 'accepted'
    );

    const invites = (conversations || []).filter(c =>
        c.participants.find(p => p.user_id === user?.user.id)?.status === 'pending'
    );

    const handleInviteResponse = async (conversationId: string, status: 'accepted' | 'rejected') => {
        if (!user?.user.id) return;
        try {
            await chatService.respondToInvite(conversationId, user.user.id, status);
            queryClient.invalidateQueries({ queryKey: ['chat', 'inbox', user.user.id] });
        } catch (error) {
            console.error('Error responding to invite:', error);
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const otherParticipant = item.participants.find((p: any) => p.user_id !== user?.user.id);
        const displayName = item.is_group ? item.name : otherParticipant?.profile?.displayName || otherParticipant?.profile?.username;

        return (
            <ListItem 
                bottomDivider
                onPress={() => navigation.navigate('ChatRoom', { conversationId: item.id, title: displayName })}
            >
                <Avatar
                    rounded
                    source={!item.is_group && otherParticipant?.profile?.avatarUrl ? { uri: otherParticipant.profile.avatarUrl } : require('@assets/images/icon.png')}
                    icon={item.is_group ? { name: 'groups', type: 'material' } : undefined}
                />
                <ListItem.Content>
                    <View style={styles.chatHeader}>
                        <ListItem.Title style={styles.displayName}>{displayName}</ListItem.Title>
                        {item.unreadCount > 0 && <Badge value={item.unreadCount} status="primary" />}
                    </View>
                    <ListItem.Subtitle numberOfLines={1} style={item.unreadCount > 0 ? styles.unreadSubtitle : styles.subtitle}>
                        {item.lastMessage ? `${item.lastMessage.author?.username}: ${item.lastMessage.content}` : 'No messages yet'}
                    </ListItem.Subtitle>
                </ListItem.Content>
                <Text style={styles.time}>
                    {formatDistanceToNow(new Date(item.last_message_at), { addSuffix: false })}
                </Text>
            </ListItem>
        );
    };

    const renderInvite = ({ item }: { item: any }) => {
        const creator = item.participants.find((p: any) => p.user_id === item.created_by);
        
        return (
            <ListItem bottomDivider>
                <Avatar rounded source={creator?.profile?.avatarUrl ? { uri: creator.profile.avatarUrl } : require('@assets/images/icon.png')} />
                <ListItem.Content>
                    <ListItem.Title style={styles.displayName}>{item.name || 'New Group'}</ListItem.Title>
                    <ListItem.Subtitle>Invited by @{creator?.profile?.username}</ListItem.Subtitle>
                    <View style={styles.inviteActions}>
                        <Button 
                            title="Accept" 
                            size="sm" 
                            onPress={() => handleInviteResponse(item.id, 'accepted')}
                            containerStyle={styles.inviteButton}
                        />
                        <Button 
                            title="Decline" 
                            type="outline" 
                            size="sm" 
                            color="error"
                            onPress={() => handleInviteResponse(item.id, 'rejected')}
                            containerStyle={styles.inviteButton}
                        />
                    </View>
                </ListItem.Content>
            </ListItem>
        );
    };

    if (isLoading && (!conversations || conversations.length === 0)) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Tab value={tabIndex} onChange={setTabIndex} indicatorStyle={{ backgroundColor: theme.colors.primary, height: 3 }}>
                <Tab.Item title={`Chats (${activeChats.length})`} titleStyle={styles.tabTitle} />
                <Tab.Item 
                    title="Invites" 
                    titleStyle={styles.tabTitle}
                    icon={invites.length > 0 ? <Badge value={invites.length} status="error" containerStyle={styles.tabBadge} /> : undefined} 
                />
            </Tab>

            <FlatList
                data={tabIndex === 0 ? activeChats : invites}
                renderItem={tabIndex === 0 ? renderItem : renderInvite}
                keyExtractor={item => item.id}
                onRefresh={refetch}
                refreshing={isLoading}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="chat" size={64} color={theme.colors.grey4} />
                        <Text style={styles.emptyText}>No messages yet.</Text>
                    </View>
                }
            />

            <TouchableOpacity 
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                onPress={() => {/* Open Create Group Screen */}}
            >
                <Icon name="add" color="white" size={30} />
            </TouchableOpacity>
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
    tabTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#000',
    },
    tabBadge: {
        position: 'absolute',
        top: -5,
        right: -10,
    },
    chatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    displayName: {
        fontWeight: '700',
        fontSize: 16,
    },
    subtitle: {
        fontSize: 14,
        color: '#536471',
    },
    unreadSubtitle: {
        fontSize: 14,
        color: '#000',
        fontWeight: '700',
    },
    time: {
        fontSize: 12,
        color: '#536471',
    },
    inviteActions: {
        flexDirection: 'row',
        marginTop: 10,
    },
    inviteButton: {
        marginRight: 10,
        width: 100,
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
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});