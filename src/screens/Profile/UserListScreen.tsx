import React, { useMemo } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, Avatar, Button, useTheme, Icon } from '@rneui/themed';
import { useUserFollowersQuery, useUserFollowingQuery } from '@/hooks/useProfileQueries';
import { useToggleFollow } from '@/hooks/useFeedQueries';
import type { StackScreenProps } from '@react-navigation/stack';
import type { ProfileStackParamList } from '@/types/navigation';

// Update ProfileStackParamList to include UserList
// I should have updated this in types/navigation.ts earlier.

type Props = any; // Will use proper types if I update navigation.ts

export const UserListScreen = ({ route, navigation }: Props) => {
    const { userId, type } = route.params;
    const { theme } = useTheme();
    const toggleFollowMutation = useToggleFollow();

    const followersQuery = useUserFollowersQuery(type === 'followers' ? userId : undefined);
    const followingQuery = useUserFollowingQuery(type === 'following' ? userId : undefined);

    const query = type === 'followers' ? followersQuery : followingQuery;

    const allUsers = useMemo(() => query.data?.pages.flatMap(page => page.items) || [], [query.data]);

    const handleLoadMore = () => {
        if (query.hasNextPage && !query.isFetchingNextPage) {
            query.fetchNextPage();
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            style={styles.userItem}
            onPress={() => navigation.push('UserProfile', { userId: item.user_id })}
        >
            <Avatar
                rounded
                size={50}
                source={item.avatar_url ? { uri: item.avatar_url } : require('@assets/images/icon.png')}
            />
            <View style={styles.userInfo}>
                <Text style={styles.username}>@{item.username}</Text>
            </View>
            <Button
                title="View"
                type="outline"
                size="sm"
                onPress={() => navigation.push('UserProfile', { userId: item.user_id })}
                buttonStyle={styles.viewButton}
            />
        </TouchableOpacity>
    );

    if (query.isLoading && allUsers.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={allUsers}
                renderItem={renderItem}
                keyExtractor={item => item.user_id}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={query.isFetchingNextPage ? <ActivityIndicator style={{ padding: 20 }} /> : null}
                ListEmptyComponent={<Text style={styles.emptyText}>No {type} found.</Text>}
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
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eff3f4',
    },
    userInfo: {
        flex: 1,
        marginLeft: 15,
    },
    username: {
        fontWeight: '700',
        fontSize: 16,
    },
    viewButton: {
        borderRadius: 20,
        paddingHorizontal: 20,
    },
    emptyText: {
        textAlign: 'center',
        color: '#536471',
        marginTop: 40,
    },
});