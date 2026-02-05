import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, Tab, TabView, useTheme, Icon } from '@rneui/themed';
import { useAtom, useAtomValue } from 'jotai';
import { userAtom } from '@/state/auth';
import { feedFiltersAtom, INITIAL_FEED_FILTERS } from '@/state/feed';
import { useFeedQuery } from '@/hooks/useFeedQueries';
import { FeedItem } from '@/components/Feed/FeedItem';
import { FeedFilterBottomSheet } from '@/components/Feed/FeedFilterBottomSheet';
import { SafeAreaView } from 'react-native-safe-area-context';

export const FeedScreen = () => {
    const { theme } = useTheme();
    const user = useAtomValue(userAtom);
    const [filters, setFilters] = useAtom(feedFiltersAtom);
    const [index, setIndex] = useState(0);
    const [filterVisible, setFilterVisible] = useState(false);
    const [visibleItems, setVisibleItems] = useState<string[]>([]);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
        refetch
    } = useFeedQuery(user?.user.id, 10, {
        ...filters,
        followingOnly: index === 1,
        lat: filters.nearMe ? undefined : filters.selectedLocation?.lat,
        lng: filters.nearMe ? undefined : filters.selectedLocation?.lng,
    });

    const allItems = useMemo(() => data?.pages.flat() || [], [data]);

    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        setVisibleItems(viewableItems.map((item: any) => item.key));
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50
    }).current;

    const renderItem = useCallback(({ item }: { item: any }) => (
        <FeedItem 
            item={item} 
            currentUserId={user?.user.id} 
            isVisible={visibleItems.includes(`${item.media_id}-${item.created_at}`)}
        />
    ), [user?.user.id, visibleItems]);

    const keyExtractor = useCallback((item: any) => `${item.media_id}-${item.created_at}`, []);

    const ListFooter = () => (
        isFetchingNextPage ? (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
        ) : null
    );

    const EmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <Icon name="photo-library" size={64} color={theme.colors.grey4} />
            <Text style={styles.emptyText}>No posts yet!</Text>
            <TouchableOpacity onPress={() => refetch()}>
                <Text style={{ color: theme.colors.primary, marginTop: 10 }}>Refresh</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text h4 style={styles.title}>SpotHop</Text>
                <TouchableOpacity onPress={() => setFilterVisible(true)}>
                    <Icon
                        name="filter-list"
                        color={filters !== INITIAL_FEED_FILTERS ? theme.colors.primary : theme.colors.black}
                    />
                </TouchableOpacity>
            </View>

            <Tab
                value={index}
                onChange={(e) => setIndex(e)}
                indicatorStyle={{
                    backgroundColor: theme.colors.primary,
                    height: 3,
                }}
                variant="primary"
            >
                <Tab.Item
                    title="For You"
                    titleStyle={{ fontSize: 14, fontWeight: '700' }}
                    containerStyle={(active) => ({
                        backgroundColor: 'transparent',
                    })}
                />
                <Tab.Item
                    title="Following"
                    titleStyle={{ fontSize: 14, fontWeight: '700' }}
                    disabled={!user}
                />
            </Tab>

            {isLoading && allItems.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={allItems}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    refreshControl={
                        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
                    }
                    ListFooterComponent={ListFooter}
                    ListEmptyComponent={EmptyComponent}
                    contentContainerStyle={allItems.length === 0 && { flex: 1 }}
                />
            )}

            <FeedFilterBottomSheet
                isVisible={filterVisible}
                onClose={() => setFilterVisible(false)}
                filters={filters}
                onApply={setFilters}
            />
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    title: {
        fontWeight: '900',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        paddingVertical: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 16,
        color: '#86939e',
        textAlign: 'center',
    },
});