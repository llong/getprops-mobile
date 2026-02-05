import React, { useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { Text, Avatar, Icon, useTheme, Button } from '@rneui/themed';
import { BottomSheet } from '@rneui/base';
import { useMediaComments, usePostMediaComment } from '@/hooks/useFeedQueries';
import { formatDistanceToNow } from 'date-fns';
import type { MediaComment } from '@/types';

interface CommentBottomSheetProps {
    isVisible: boolean;
    onClose: () => void;
    mediaId: string;
    mediaType: 'photo' | 'video';
    userId?: string;
}

export const CommentBottomSheet = ({ isVisible, onClose, mediaId, mediaType, userId }: CommentBottomSheetProps) => {
    const { theme } = useTheme();
    const [newComment, setNewComment] = useState('');
    const { data: comments, isLoading } = useMediaComments(mediaId, mediaType, userId);
    const postCommentMutation = usePostMediaComment();

    const handlePost = async () => {
        if (!newComment.trim() || !userId) return;

        try {
            await postCommentMutation.mutateAsync({
                mediaId,
                mediaType,
                content: newComment.trim()
            });
            setNewComment('');
        } catch (error) {
            console.error('Post comment failed', error);
        }
    };

    const renderItem = ({ item }: { item: MediaComment }) => (
        <View style={styles.commentItem}>
            <Avatar
                rounded
                size={32}
                source={item.author?.avatarUrl ? { uri: item.author.avatarUrl } : require('@assets/images/icon.png')}
            />
            <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                    <Text style={styles.authorName}>@{item.author?.username || 'unknown'}</Text>
                    <Text style={styles.timestamp}>
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </Text>
                </View>
                <Text style={styles.commentText}>{item.content}</Text>
                <View style={styles.commentActions}>
                    <Icon 
                        name={item.reactions?.userReaction === 'like' ? "favorite" : "favorite-border"} 
                        size={14} 
                        color={item.reactions?.userReaction === 'like' ? theme.colors.error : theme.colors.grey3} 
                    />
                    <Text style={styles.likeCount}>{item.reactions?.likes || 0}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <BottomSheet isVisible={isVisible} onBackdropPress={onClose}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Comments</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Icon name="close" />
                    </TouchableOpacity>
                </View>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color={theme.colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={comments}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>No comments yet.</Text>
                        }
                    />
                )}

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder={userId ? "Add a comment..." : "Login to comment"}
                        value={newComment}
                        onChangeText={setNewComment}
                        multiline
                        disabled={!userId || postCommentMutation.isPending}
                    />
                    <Button
                        type="clear"
                        disabled={!newComment.trim() || !userId || postCommentMutation.isPending}
                        onPress={handlePost}
                        icon={<Icon name="send" color={theme.colors.primary} />}
                    />
                </View>
            </KeyboardAvoidingView>
        </BottomSheet>
    );
};

import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eff3f4',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    listContent: {
        padding: 15,
    },
    commentItem: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    commentContent: {
        flex: 1,
        marginLeft: 12,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    authorName: {
        fontWeight: '700',
        fontSize: 14,
    },
    timestamp: {
        fontSize: 12,
        color: '#536471',
        marginLeft: 8,
    },
    commentText: {
        fontSize: 14,
        lineHeight: 18,
        color: '#0f1419',
    },
    commentActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    likeCount: {
        fontSize: 12,
        color: '#536471',
        marginLeft: 4,
    },
    emptyText: {
        textAlign: 'center',
        color: '#536471',
        marginTop: 40,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#eff3f4',
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        backgroundColor: '#eff3f4',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        maxHeight: 100,
    },
});