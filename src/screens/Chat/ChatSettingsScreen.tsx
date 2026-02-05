import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Text, Avatar, Icon, useTheme, Button, ListItem, SearchBar, Chip } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAtomValue } from 'jotai';
import { userAtom } from '@/state/auth';
import { chatService } from '@/services/chatService';
import { profileService } from '@/services/profileService';
import { UserProfile, ConversationParticipant, Conversation } from '@/types';
import Toast from 'react-native-toast-message';
import { useConversationQuery } from '@/hooks/useChatQueries';
import { supabase } from '@/utils/supabase';

interface Props {
    route: any;
    navigation: any;
}

export const ChatSettingsScreen = ({ route, navigation }: Props) => {
    const { conversationId, chatTitle: initialChatTitle } = route.params;
    const { theme } = useTheme();
    const user = useAtomValue(userAtom);
    const currentUserId = user?.user.id;
    
    const { data: conversation, isLoading, refetch } = useConversationQuery(conversationId, currentUserId);

    const [groupName, setGroupName] = useState(initialChatTitle || conversation?.name || '');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>([]); // For new invites
    const [isSearching, setIsSearching] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (conversation && !groupName) {
            setGroupName(conversation.name || '');
        }
    }, [conversation, groupName]);

    const isAdmin = conversation?.participants.find(p => p.user_id === currentUserId)?.role === 'admin';
    const isGroupChat = conversation?.is_group;

    const handleSearch = useCallback(async (query: string) => {
        if (query.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const results = await profileService.searchUsers(query);
            // Filter out existing participants and current user
            const existingParticipantIds = new Set(conversation?.participants.map(p => p.user_id));
            const filteredResults = results.filter(
                u => u.id !== currentUserId && !existingParticipantIds.has(u.id) && !selectedUsers.some(su => su.id === u.id)
            );
            setSearchResults(filteredResults);
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setIsSearching(false);
        }
    }, [currentUserId, conversation?.participants, selectedUsers]);

    useEffect(() => {
        const handler = setTimeout(() => {
            handleSearch(searchQuery);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchQuery, handleSearch]);

    const toggleSelectedUser = (userProfile: UserProfile) => {
        setSelectedUsers(prev =>
            prev.some(u => u.id === userProfile.id)
                ? prev.filter(u => u.id !== userProfile.id)
                : [...prev, userProfile]
        );
        // Remove from search results after selection
        setSearchResults(prev => prev.filter(u => u.id !== userProfile.id));
    };

    const handleBulkInvite = async () => {
        if (selectedUsers.length === 0 || !conversationId || !currentUserId) return;
        setIsSaving(true);
        try {
            const participantIds = selectedUsers.map(u => u.id);
            await chatService.inviteUsersToGroup(conversationId, participantIds);
            Toast.show({ type: 'success', text1: `${selectedUsers.length} user(s) invited!` });
            setSelectedUsers([]);
            setSearchQuery('');
            refetch(); // Refresh conversation data
        } catch (error) {
            console.error('Error inviting users:', error);
            Toast.show({ type: 'error', text1: 'Failed to send invites' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveParticipant = async (participantUserId: string) => {
        if (!conversationId || !currentUserId || !conversation || !isAdmin) return;
        if (!confirm(`Are you sure you want to remove ${conversation.participants.find(p => p.user_id === participantUserId)?.profile?.username || 'this user'}?`)) return;

        setIsSaving(true);
        try {
            await chatService.removeParticipant(conversationId, participantUserId);
            Toast.show({ type: 'success', text1: 'Participant removed' });
            refetch();
        } catch (error) {
            console.error('Error removing participant:', error);
            Toast.show({ type: 'error', text1: 'Failed to remove participant' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateGroupName = async () => {
        if (!conversationId || !groupName.trim() || !isGroupChat || !isAdmin) return;
        if (groupName === conversation?.name) return; // No change

        setIsSaving(true);
        try {
            await chatService.updateGroupName(conversationId, groupName.trim());
            Toast.show({ type: 'success', text1: 'Group name updated!' });
            navigation.setParams({ chatTitle: groupName.trim() }); // Update header title immediately
            refetch();
        } catch (error) {
            console.error('Error updating group name:', error);
            Toast.show({ type: 'error', text1: 'Failed to update group name' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleLeaveGroup = async () => {
        if (!conversationId || !currentUserId || !isGroupChat || !confirm('Are you sure you want to leave this group?')) return;
        setIsSaving(true);
        try {
            await chatService.leaveGroup(conversationId, currentUserId);
            Toast.show({ type: 'success', text1: 'You have left the group.' });
            navigation.popToTop(); // Go back to Chat Inbox
            navigation.navigate('ChatStack', { screen: 'ChatInbox' });
        } catch (error) {
            console.error('Error leaving group:', error);
            Toast.show({ type: 'error', text1: 'Failed to leave group' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || !conversation) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={[styles.header, { borderBottomColor: theme.colors.grey5 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isGroupChat ? 'Group Settings' : 'Chat Settings'}</Text>
                <View style={{ width: 24 }} /> {/* Placeholder for alignment */}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {isGroupChat && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Group Name</Text>
                        <View style={styles.groupNameInputContainer}>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.colors.grey5 }]}
                                placeholder="Enter group name"
                                placeholderTextColor={theme.colors.grey2}
                                value={groupName}
                                onChangeText={setGroupName}
                                maxLength={50}
                                editable={isAdmin && !isSaving}
                            />
                            {isAdmin && (
                                <Button
                                    title="Save"
                                    onPress={handleUpdateGroupName}
                                    disabled={!groupName.trim() || groupName === conversation.name || isSaving}
                                    loading={isSaving}
                                    containerStyle={styles.saveButtonContainer}
                                />
                            )}
                        </View>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Participants ({conversation.participants.length})</Text>
                    <FlatList
                        data={conversation.participants}
                        renderItem={({ item }) => (
                            <ListItem bottomDivider>
                                <Avatar rounded size={36} source={item.profile?.avatarUrl ? { uri: item.profile.avatarUrl } : require('@assets/images/icon.png')} />
                                <ListItem.Content>
                                    <ListItem.Title>{item.profile?.displayName || item.profile?.username}</ListItem.Title>
                                    <ListItem.Subtitle>@{item.profile?.username} {item.role === 'admin' && '(Admin)'}</ListItem.Subtitle>
                                </ListItem.Content>
                                {isAdmin && item.user_id !== currentUserId && (
                                    <TouchableOpacity onPress={() => handleRemoveParticipant(item.user_id)} disabled={isSaving}>
                                        <Icon name="remove-circle-outline" color={theme.colors.error} />
                                    </TouchableOpacity>
                                )}
                            </ListItem>
                        )}
                        keyExtractor={item => item.user_id}
                        style={styles.participantsList}
                        scrollEnabled={false} // Nested FlatList
                    />
                </View>

                {isGroupChat && (isAdmin || conversation.participants.some(p => p.user_id === currentUserId && p.status === 'accepted')) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Invite Users</Text>
                        {selectedUsers.length > 0 && (
                            <FlatList
                                data={selectedUsers}
                                renderItem={({ item }) => (
                                    <View style={styles.selectedUserChip}>
                                        <Avatar rounded size="small" source={item.avatarUrl ? { uri: item.avatarUrl } : require('@assets/images/icon.png')} />
                                        <Text style={styles.selectedUserName}>@{item.username}</Text>
                                        <TouchableOpacity onPress={() => toggleSelectedUser(item)} style={styles.removeUserButton}>
                                            <Icon name="close" size={16} color={theme.colors.grey1} />
                                        </TouchableOpacity>
                                    </View>
                                )}
                                keyExtractor={item => item.id}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.selectedUsersListContainer}
                            />
                        )}
                        <SearchBar
                            placeholder="Search users to add..."
                            onChangeText={setSearchQuery}
                            value={searchQuery}
                            lightTheme
                            round
                            containerStyle={{ backgroundColor: 'transparent', borderTopWidth: 0, borderBottomWidth: 0, paddingHorizontal: 0 }}
                            inputContainerStyle={[styles.input, { backgroundColor: theme.colors.grey5, height: 40 }]}
                            inputStyle={{ fontSize: 16 }}
                            showLoading={isSearching}
                            editable={!isSaving}
                        />
                        <FlatList
                            data={searchResults}
                            renderItem={({ item }) => (
                                <ListItem bottomDivider onPress={() => toggleUserSelection(item)} disabled={isSaving}>
                                    <Avatar rounded source={item.avatarUrl ? { uri: item.avatarUrl } : require('@assets/images/icon.png')} />
                                    <ListItem.Content>
                                        <ListItem.Title>{item.displayName || item.username}</ListItem.Title>
                                        <ListItem.Subtitle>@{item.username}</ListItem.Subtitle>
                                    </ListItem.Content>
                                    <Icon name={selectedUsers.some(u => u.id === item.id) ? "check-box" : "check-box-outline-blank"} type="material" color={theme.colors.primary} />
                                </ListItem>
                            )}
                            keyExtractor={item => item.id}
                            style={styles.searchResultsList}
                        />
                        <Button
                            title={`Invite ${selectedUsers.length} User(s)`}
                            onPress={handleBulkInvite}
                            disabled={selectedUsers.length === 0 || isSaving}
                            loading={isSaving}
                            containerStyle={styles.inviteButtonContainer}
                            buttonStyle={styles.inviteButton}
                            titleStyle={styles.inviteButtonTitle}
                        />
                    </View>
                )}

                {isGroupChat && (
                    <View style={styles.section}>
                        <Button
                            title="Leave Group"
                            onPress={handleLeaveGroup}
                            disabled={isSaving}
                            loading={isSaving}
                            containerStyle={styles.leaveGroupButtonContainer}
                            buttonStyle={[styles.leaveGroupButton, { backgroundColor: theme.colors.error }]}
                            titleStyle={styles.leaveGroupButtonTitle}
                        />
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
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
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        zIndex: 1,
    },
    backButton: {
        marginRight: 10,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 10,
    },
    scrollContent: {
        padding: 15,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 10,
    },
    groupNameInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    input: {
        flex: 1,
        height: 40,
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#0f1419',
    },
    saveButtonContainer: {
        marginLeft: 10,
        borderRadius: 10,
    },
    participantsList: {
        marginBottom: 10,
    },
    selectedUsersListContainer: {
        marginBottom: 10,
        flexGrow: 0,
    },
    selectedUserChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e1e8ed',
        borderRadius: 20,
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginRight: 8,
    },
    selectedUserName: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
    },
    removeUserButton: {
        marginLeft: 8,
    },
    searchResultsList: {
        maxHeight: 150, // Limit height for search results
    },
    inviteButtonContainer: {
        marginTop: 10,
        borderRadius: 20,
    },
    inviteButton: {
        backgroundColor: '#1d9bf0',
        borderRadius: 20,
        height: 45,
    },
    inviteButtonTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    leaveGroupButtonContainer: {
        marginTop: 20,
        borderRadius: 20,
    },
    leaveGroupButton: {
        borderRadius: 20,
        height: 45,
    },
    leaveGroupButtonTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
});