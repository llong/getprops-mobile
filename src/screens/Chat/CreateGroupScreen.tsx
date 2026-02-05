import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, TextInput, ActivityIndicator, FlatList, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Text, Button, Icon, useTheme, Avatar, ListItem, SearchBar } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAtomValue } from 'jotai';
import { userAtom } from '@/state/auth';
import { chatService } from '@/services/chatService';
import { profileService } from '@/services/profileService';
import { UserProfile } from '@/types';
import Toast from 'react-native-toast-message';

export const CreateGroupScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation() as any;
    const auth = useAtomValue(userAtom);
    const currentUserId = auth?.user.id;

    const [groupName, setGroupName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);

    const handleSearch = useCallback(async (query: string) => {
        if (query.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const results = await profileService.searchUsers(query);
            // Filter out already selected users and the current user
            const filteredResults = results.filter(
                u => u.id !== currentUserId && !selectedUsers.some(su => su.id === u.id)
            );
            setSearchResults(filteredResults);
        } catch (error) {
            console.error('Error searching users:', error);
            Toast.show({
                type: 'error',
                text1: 'User search failed',
            });
        } finally {
            setIsSearching(false);
        }
    }, [currentUserId, selectedUsers]);

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            handleSearch(searchQuery);
        }, 300); // 300ms debounce
        return () => clearTimeout(handler);
    }, [searchQuery, handleSearch]);

    const toggleUserSelection = (user: UserProfile) => {
        setSelectedUsers(prev => {
            if (prev.some(u => u.id === user.id)) {
                return prev.filter(u => u.id !== user.id);
            } else {
                return [...prev, user];
            }
        });
        // Clear search results after selection to keep UI clean, but don't clear search query
        setSearchResults(prev => prev.filter(u => u.id !== user.id));
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Group name is required',
            });
            return;
        }
        if (selectedUsers.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'Select at least one member',
            });
            return;
        }
        if (!currentUserId) {
            Toast.show({
                type: 'error',
                text1: 'User not authenticated',
            });
            return;
        }

        setIsCreatingGroup(true);
        try {
            const participantIds = selectedUsers.map(u => u.id);
            const chatId = await chatService.createGroup(groupName.trim(), participantIds, currentUserId);
            
            Toast.show({
                type: 'success',
                text1: 'Group created!',
            });
            navigation.replace('ChatStack', { screen: 'ChatRoom', params: { conversationId: chatId, title: groupName.trim() } });
        } catch (error) {
            console.error('Failed to create group:', error);
            Toast.show({
                type: 'error',
                text1: 'Failed to create group',
                text2: (error as Error).message,
            });
        } finally {
            setIsCreatingGroup(false);
        }
    };

    const renderSelectedUser = ({ item }: { item: UserProfile }) => (
        <View style={styles.selectedUserChip}>
            <Avatar rounded size="small" source={item.avatarUrl ? { uri: item.avatarUrl } : require('@assets/images/icon.png')} />
            <Text style={styles.selectedUserName}>@{item.username}</Text>
            <TouchableOpacity onPress={() => toggleUserSelection(item)} style={styles.removeUserButton}>
                <Icon name="close" size={16} color={theme.colors.grey1} />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={[styles.header, { borderBottomColor: theme.colors.grey5 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Group</Text>
                <View style={{ width: 24 }} /> {/* Placeholder for alignment */}
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Group Name</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.colors.grey5 }]}
                            placeholder="Enter group name"
                            placeholderTextColor={theme.colors.grey2}
                            value={groupName}
                            onChangeText={setGroupName}
                            maxLength={50}
                            editable={!isCreatingGroup}
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Participants</Text>
                        {selectedUsers.length > 0 && (
                            <FlatList
                                data={selectedUsers}
                                renderItem={renderSelectedUser}
                                keyExtractor={item => item.id}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.selectedUsersList}
                            />
                        )}
                        <SearchBar
                            placeholder="Search users to add..."
                            onChangeText={setSearchQuery}
                            value={searchQuery}
                            lightTheme
                            round
                            containerStyle={{ backgroundColor: 'transparent', borderTopWidth: 0, borderBottomWidth: 0, paddingHorizontal: 0 }}
                            inputContainerStyle={[styles.input, { backgroundColor: theme.colors.grey5 }]}
                            inputStyle={{ fontSize: 16 }}
                            showLoading={isSearching}
                            editable={!isCreatingGroup}
                        />
                        {isSearching && <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 10 }} />}
                        {!isSearching && searchResults.length === 0 && searchQuery.length >= 2 && (
                            <Text style={styles.emptySearchText}>No users found.</Text>
                        )}
                        <FlatList
                            data={searchResults}
                            renderItem={({ item }) => (
                                <ListItem bottomDivider onPress={() => toggleUserSelection(item)} disabled={isCreatingGroup}>
                                    <Avatar rounded source={item.avatarUrl ? { uri: item.avatarUrl } : require('@assets/images/icon.png')} />
                                    <ListItem.Content>
                                        <ListItem.Title>{item.displayName || item.username}</ListItem.Title>
                                        <ListItem.Subtitle>@{item.username}</ListItem.Subtitle>
                                    </ListItem.Content>
                                    <Icon name={selectedUsers.some(u => u.id === item.id) ? "check-box" : "check-box-outline-blank"} type="material" color={theme.colors.primary} />
                                </ListItem>
                            )}
                            keyExtractor={item => item.id}
                            style={styles.resultsList}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <Button
                    title="Create Group"
                    onPress={handleCreateGroup}
                    disabled={!groupName.trim() || selectedUsers.length === 0 || isCreatingGroup}
                    loading={isCreatingGroup}
                    containerStyle={styles.createButtonContainer}
                    buttonStyle={styles.createButton}
                    titleStyle={styles.createButtonTitle}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eff3f4',
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
    input: {
        height: 40,
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#0f1419',
    },
    selectedUsersList: {
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
    resultsList: {
        maxHeight: 200,
    },
    emptySearchText: {
        textAlign: 'center',
        color: '#536471',
        marginTop: 20,
    },
    footer: {
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#eff3f4',
        backgroundColor: '#fff',
    },
    createButtonContainer: {
        borderRadius: 20,
    },
    createButton: {
        backgroundColor: '#1d9bf0',
        borderRadius: 20,
        height: 50,
    },
    createButtonTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
});