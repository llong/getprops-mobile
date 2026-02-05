import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Button, Icon, useTheme, Switch, Slider, Chip } from '@rneui/themed';
import { BottomSheet } from '@rneui/base';
import type { FeedFilters } from '@/state/feed';
import { INITIAL_FEED_FILTERS } from '@/state/feed';

interface FeedFilterBottomSheetProps {
    isVisible: boolean;
    onClose: () => void;
    filters: FeedFilters;
    onApply: (filters: FeedFilters) => void;
}

export const FeedFilterBottomSheet = ({ isVisible, onClose, filters: initialFilters, onApply }: FeedFilterBottomSheetProps) => {
    const { theme } = useTheme();
    const [tempFilters, setTempFilters] = useState<FeedFilters>(initialFilters);

    const handleApply = () => {
        onApply(tempFilters);
        onClose();
    };

    const handleReset = () => {
        setTempFilters(INITIAL_FEED_FILTERS);
    };

    const toggleArrayItem = (array: string[], item: string) => {
        return array.includes(item) 
            ? array.filter(i => i !== item)
            : [...array, item];
    };

    const spotTypes = ['rail', 'ledge', 'gap', 'wall_ride', 'skatepark', 'manual_pad'];
    const difficulties = ['beginner', 'intermediate', 'advanced'];
    const riderTypes = ['skateboard', 'inline', 'bmx', 'scooter'];

    return (
        <BottomSheet isVisible={isVisible} onBackdropPress={onClose}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text h4 style={styles.headerTitle}>Feed Filters</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Icon name="close" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.scrollContent}>
                    <View style={styles.section}>
                        <View style={styles.row}>
                            <Text style={styles.sectionTitle}>Near Me</Text>
                            <Switch 
                                value={tempFilters.nearMe}
                                onValueChange={(val) => setTempFilters(f => ({ ...f, nearMe: val }))}
                            />
                        </View>
                        {tempFilters.nearMe && (
                            <View style={styles.sliderContainer}>
                                <Text style={styles.label}>Distance: {tempFilters.maxDistKm} km</Text>
                                <Slider
                                    value={tempFilters.maxDistKm}
                                    onValueChange={(val) => setTempFilters(f => ({ ...f, maxDistKm: val }))}
                                    minimumValue={1}
                                    maximumValue={500}
                                    step={5}
                                    thumbStyle={{ height: 20, width: 20 }}
                                    thumbTintColor={theme.colors.primary}
                                />
                            </View>
                        )}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Spot Types</Text>
                        <View style={styles.chipContainer}>
                            {spotTypes.map(type => (
                                <Chip
                                    key={type}
                                    title={type.replace('_', ' ').toUpperCase()}
                                    onPress={() => setTempFilters(f => ({ ...f, spotTypes: toggleArrayItem(f.spotTypes, type) }))}
                                    type={tempFilters.spotTypes.includes(type) ? "solid" : "outline"}
                                    containerStyle={styles.chip}
                                />
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Difficulty</Text>
                        <View style={styles.chipContainer}>
                            {difficulties.map(diff => (
                                <Chip
                                    key={diff}
                                    title={diff.toUpperCase()}
                                    onPress={() => setTempFilters(f => ({ ...f, difficulties: toggleArrayItem(f.difficulties, diff) }))}
                                    type={tempFilters.difficulties.includes(diff) ? "solid" : "outline"}
                                    containerStyle={styles.chip}
                                />
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Maximum Risk: {tempFilters.maxRisk}</Text>
                        <Slider
                            value={tempFilters.maxRisk}
                            onValueChange={(val) => setTempFilters(f => ({ ...f, maxRisk: val }))}
                            minimumValue={1}
                            maximumValue={5}
                            step={1}
                            thumbStyle={{ height: 20, width: 20 }}
                            thumbTintColor={theme.colors.primary}
                        />
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <Button 
                        title="Reset" 
                        type="outline" 
                        containerStyle={styles.buttonContainer}
                        onPress={handleReset}
                    />
                    <Button 
                        title="Apply" 
                        containerStyle={styles.buttonContainer}
                        onPress={handleApply}
                    />
                </View>
            </View>
        </BottomSheet>
    );
};

import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 30,
        maxHeight: '90%',
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
        fontWeight: '800',
    },
    scrollContent: {
        padding: 20,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sliderContainer: {
        marginTop: 10,
    },
    label: {
        fontSize: 14,
        color: '#536471',
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        marginBottom: 4,
    },
    footer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 10,
    },
    buttonContainer: {
        flex: 1,
    },
});