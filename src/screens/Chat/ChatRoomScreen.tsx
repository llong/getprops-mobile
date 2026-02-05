import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { Text, Avatar, Icon, useTheme, Button } from '@rneui/themed';
import { useMessagesQuery, useSendMessageMutation, useConversationQuery } from '@/hooks/useChatQueries';
import { useAtomValue } from 'jotai';
import { userAtom } from '@/state/auth';
import { format } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackActions } from '@react-navigation/native';

interface Props {
    route: any;
    navigation: any;
}

export const ChatRoomScreen = ({ route, navigation }: Props) => {
    const { conversationId } = route.params;
    const { theme } = useTheme();
    const user = useAtomValue(userAtom);
    const flatListRef = useRef<FlatList>(null);

    const { data: messages = [], isLoading: loadingMessages } = useMessagesQuery(conversationId);
    const { data: chat, isLoading: loadingChat } = useConversationQuery(conversationId, user?.user.id);
    const sendMessageMutation = useSendMessageMutation(conversationId);

    const [content, setContent] = useState('');

    const handleSend = async () => {
        if (!content.trim() || !user?.user.id) return;
        
        const messageContent = content.trim();
        setContent('');

        try {
            await sendMessageMutation.mutateAsync({
                senderId: user.user.id,
                content: messageContent
            });
        } catch (error) {
            console.error('Failed to send message:', error);
            setContent(messageContent);
        }
    };

    const renderItem = ({ item, index }: { item: any, index: number }) => {
        const isMe = item.sender_id === user?.user.id;
        const showAvatar = !isMe && (index === messages.length - 1 || messages[index + 1].sender_id !== item.sender_id);

        return (
            <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage]}>
                {!isMe && (
                    <View style={styles.avatarPlaceholder}>
                        {showAvatar && (
                            <Avatar
                                rounded
                                size={28}
                                source={item.author?.avatarUrl ? { uri: item.author.avatarUrl } : require('@assets/images/icon.png')}
                            />
                        )}
                    </View>
                )}
                <View style={[
                    styles.bubble,
                    isMe ? styles.myBubble : styles.theirBubble,
                    { backgroundColor: isMe ? theme.colors.primary : '#eff3f4' }
                ]}>
                    <Text style={[styles.messageText, isMe && { color: 'white' }]}>
                        {item.content}
                    </Text>
                    <Text style={[styles.time, isMe && { color: 'rgba(255,255,255,0.7)' }]}>
                        {format(new Date(item.created_at), 'h:mm a')}
                    </Text>
                </View>
            </View>
        );
    };

    if (loadingChat || loadingMessages) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    const chatTitle = route.params?.title || chat?.name || 'Chat';

    const handleGoBack = () => {
        // If coming from notifications, go to ChatInbox
        if (route.params?.fromNotification) {
            navigation.dispatch(StackActions.replace('ChatStack', { screen: 'ChatInbox' }));
        } else {
            navigation.goBack();
        }
    };

    const handleOpenSettings = () => {
        navigation.navigate('ChatStack', { screen: 'ChatSettings', params: { conversationId, chatTitle } });
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.white, borderBottomColor: theme.colors.grey5 }]}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <Icon name="arrow-back" />
                </TouchableOpacity>
                <Avatar
                    rounded
                    size={34}
                    source={chat?.is_group ? require('@assets/images/icon.png') : (chat?.participants.find(p => p.user_id !== user?.user.id)?.profile?.avatarUrl ? { uri: chat.participants.find(p => p.user_id !== user?.user.id)?.profile?.avatarUrl } : require('@assets/images/icon.png'))}
                />
                <Text style={styles.chatTitle} numberOfLines={1}>{chatTitle}</Text>
                <TouchableOpacity onPress={handleOpenSettings} style={styles.settingsButton}>
                    <Icon name="info-outline" />
                </TouchableOpacity>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={[styles.inputContainer, { borderTopColor: theme.colors.grey5 }]}>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.grey5 }]}
                        placeholder="Message..."
                        placeholderTextColor={theme.colors.grey2}
                        value={content}
                        onChangeText={setContent}
                        multiline
                    />
                    <Button
                        type="clear"
                        disabled={!content.trim() || sendMessageMutation.isPending}
                        onPress={handleSend}
                        icon={<Icon name="send" color={theme.colors.primary} />}
                    />
                </View>
            </KeyboardAvoidingView>
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
        zIndex: 1,
    },
    backButton: {
        marginRight: 10,
    },
    chatTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 10,
    },
    settingsButton: {
        marginLeft: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    listContent: {
        padding: 15,
    },
    messageContainer: {
        flexDirection: 'row',
        marginBottom: 4,
        alignItems: 'flex-end',
    },
    myMessage: {
        justifyContent: 'flex-end',
    },
    theirMessage: {
        justifyContent: 'flex-start',
    },
    avatarPlaceholder: {
        width: 32,
        marginRight: 4,
    },
    bubble: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 18,
        maxWidth: '75%',
    },
    myBubble: {
        borderBottomRightRadius: 2,
    },
    theirBubble: {
        borderBottomLeftRadius: 2,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    time: {
        fontSize: 10,
        color: '#536471',
        alignSelf: 'flex-end',
        marginTop: 2,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderTopWidth: 1,
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