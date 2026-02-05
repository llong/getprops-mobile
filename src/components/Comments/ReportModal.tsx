import React, { useState } from 'react';
import { StyleSheet, View, TextInput, ActivityIndicator } from 'react-native';
import { Text, Button, Overlay, Icon, useTheme, CheckBox } from '@rneui/themed';
import { supabase } from '@/utils/supabase';
import { SPOT_FLAG_REASONS, type SpotFlagReason } from '@/types';

interface ReportModalProps {
    isVisible: boolean;
    onClose: () => void;
    targetId: string;
    targetType: 'spot' | 'comment' | 'media';
    userId?: string;
}

export const ReportModal = ({ isVisible, onClose, targetId, targetType, userId }: ReportModalProps) => {
    const { theme } = useTheme();
    const [reason, setReason] = useState<SpotFlagReason>('inappropriate_content');
    const [details, setDetails] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!userId) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('content_reports')
                .insert({
                    user_id: userId,
                    target_id: targetId,
                    target_type: targetType,
                    reason,
                    details: details.trim() || null
                });

            if (error) throw error;
            onClose();
            setDetails('');
        } catch (error) {
            console.error('Report failed', error);
            alert('Failed to submit report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Overlay isVisible={isVisible} onBackdropPress={onClose} overlayStyle={styles.overlay}>
            <View style={styles.container}>
                <Text h4 style={styles.title}>Report {targetType}</Text>
                
                <View style={styles.reasonsContainer}>
                    {Object.entries(SPOT_FLAG_REASONS).map(([key, label]) => (
                        <CheckBox
                            key={key}
                            title={label}
                            checkedIcon="dot-circle-o"
                            uncheckedIcon="circle-o"
                            checked={reason === key}
                            onPress={() => setReason(key as SpotFlagReason)}
                            containerStyle={styles.checkbox}
                            textStyle={styles.checkboxText}
                        />
                    ))}
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="Additional details (optional)..."
                    value={details}
                    onChangeText={setDetails}
                    multiline
                    numberOfLines={4}
                />

                <View style={styles.footer}>
                    <Button 
                        title="Cancel" 
                        type="clear" 
                        onPress={onClose} 
                    />
                    <Button 
                        title="Submit Report" 
                        color="error"
                        onPress={handleSubmit}
                        loading={isSubmitting}
                        disabled={reason === 'other' && !details.trim()}
                    />
                </View>
            </View>
        </Overlay>
    );
};

const styles = StyleSheet.create({
    overlay: {
        width: '90%',
        borderRadius: 15,
        padding: 20,
    },
    container: {
        width: '100%',
    },
    title: {
        marginBottom: 20,
        textAlign: 'center',
    },
    reasonsContainer: {
        marginBottom: 20,
    },
    checkbox: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 5,
        margin: 0,
    },
    checkboxText: {
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#eff3f4',
        borderRadius: 10,
        padding: 10,
        height: 100,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
});