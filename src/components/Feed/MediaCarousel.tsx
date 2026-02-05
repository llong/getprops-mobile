import React, { useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Dimensions, TouchableWithoutFeedback } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { Video, ResizeMode } from 'expo-av';
import FastImage from 'react-native-fast-image';
import { Text, Icon } from '@rneui/themed';

const { width: windowWidth } = Dimensions.get('window');
const CAROUSEL_HEIGHT = windowWidth * 0.75; // 4:3 aspect ratio

interface MediaCarouselProps {
    media: Array<{
        id: string;
        url: string;
        type: 'photo' | 'video';
        thumbnailUrl?: string;
    }>;
}

export const MediaCarousel = ({ media }: MediaCarouselProps) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const videoRef = useRef<Video>(null);
    const [status, setStatus] = useState<any>({});

    const renderItem = ({ item, index }: { item: any, index: number }) => {
        if (item.type === 'photo') {
            return (
                <View style={styles.slide}>
                    <FastImage
                        style={styles.media}
                        source={{
                            uri: item.url,
                            priority: FastImage.priority.normal,
                        }}
                        resizeMode={FastImage.resizeMode.cover}
                    />
                </View>
            );
        }

        return (
            <View style={styles.slide}>
                <Video
                    ref={videoRef}
                    style={styles.media}
                    source={{ uri: item.url }}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping
                    onPlaybackStatusUpdate={status => setStatus(() => status)}
                />
                {!status.isPlaying && (
                    <View style={styles.playOverlay}>
                        <Icon name="play-arrow" size={50} color="#fff" />
                    </View>
                )}
            </View>
        );
    };

    if (media.length === 0) return null;

    return (
        <View style={styles.container}>
            <Carousel
                loop={false}
                width={windowWidth}
                height={CAROUSEL_HEIGHT}
                autoPlay={false}
                data={media}
                scrollAnimationDuration={1000}
                onSnapToItem={(index) => setActiveIndex(index)}
                renderItem={renderItem}
            />
            {media.length > 1 && (
                <View style={styles.pagination}>
                    <Text style={styles.paginationText}>
                        {activeIndex + 1} / {media.length}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: CAROUSEL_HEIGHT,
        backgroundColor: '#000',
    },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    media: {
        width: '100%',
        height: '100%',
    },
    playOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        pointerEvents: 'none',
    },
    pagination: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    paginationText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
});