import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Modal, ScrollView, Alert, Platform } from 'react-native';
import { AyahData } from '../storage/dailyAyahStorage';
import { useThemeColors } from '../hooks/useThemeColors';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

interface AyahCardProps {
    ayah: AyahData;
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
    showActions?: boolean;
}

export const AyahCard: React.FC<AyahCardProps> = ({
    ayah,
    isFavorite = false,
    onToggleFavorite,
    showActions = true
}) => {
    const colors = useThemeColors();
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
    const [showTafseer, setShowTafseer] = useState(false);
    const viewShotRef = useRef<ViewShot>(null);

    const soundRef = useRef<Audio.Sound | null>(null);
    const nextSoundRef = useRef<Audio.Sound | null>(null);

    // Configure audio for background playback
    useEffect(() => {
        const configureAudio = async () => {
            try {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                    staysActiveInBackground: true,
                    playsInSilentModeIOS: true,
                    shouldDuckAndroid: true,
                    interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
                    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
                });
            } catch (e) {
                console.error('Error configuring audio', e);
            }
        };
        configureAudio();
    }, []);

    // Unload sound when unmounting
    useEffect(() => {
        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
            if (nextSoundRef.current) {
                nextSoundRef.current.unloadAsync();
            }
        };
    }, []);

    // Reset audio state when ayah changes
    useEffect(() => {
        const resetAudio = async () => {
            if (soundRef.current) {
                await soundRef.current.unloadAsync();
                soundRef.current = null;
            }
            if (nextSoundRef.current) {
                await nextSoundRef.current.unloadAsync();
                nextSoundRef.current = null;
            }
            setSound(null);
            setIsPlaying(false);
            setCurrentAudioIndex(0);
        };
        resetAudio();
    }, [ayah.id]);

    const playNextAudio = async (index: number) => {
        if (index >= ayah.audioUrls.length) {
            // Sequence finished: Clean up the last sound
            if (soundRef.current) {
                soundRef.current.setOnPlaybackStatusUpdate(null);
                await soundRef.current.unloadAsync();
                soundRef.current = null;
            }
            setIsPlaying(false);
            setCurrentAudioIndex(0);
            return;
        }

        try {
            let soundToPlay: Audio.Sound;

            // 1. Use preloaded sound if available
            if (nextSoundRef.current) {
                soundToPlay = nextSoundRef.current;
                nextSoundRef.current = null;
            } else {
                // 2. Or load it now
                const { sound } = await Audio.Sound.createAsync(
                    { uri: ayah.audioUrls[index] },
                    { shouldPlay: false }
                );
                soundToPlay = sound;
            }

            // 3. Unload previous sound safely
            if (soundRef.current) {
                soundRef.current.setOnPlaybackStatusUpdate(null); // Prevent double-trigger
                await soundRef.current.unloadAsync();
            }

            // 4. Set as current and play
            soundRef.current = soundToPlay;
            setSound(soundToPlay);
            setCurrentAudioIndex(index);
            setIsPlaying(true);

            soundToPlay.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    playNextAudio(index + 1);
                }
            });

            await soundToPlay.playAsync();

            // 5. Preload next sound
            if (index + 1 < ayah.audioUrls.length) {
                try {
                    const { sound: nextSound } = await Audio.Sound.createAsync(
                        { uri: ayah.audioUrls[index + 1] },
                        { shouldPlay: false }
                    );
                    nextSoundRef.current = nextSound;
                } catch (e) {
                    console.log('Error preloading next audio', e);
                }
            }

        } catch (error) {
            console.error('Error playing audio sequence', error);
            setIsPlaying(false);
        }
    };

    const toggleAudio = async () => {
        if (!ayah.audioUrls || ayah.audioUrls.length === 0) return;

        if (isPlaying && soundRef.current) {
            await soundRef.current.pauseAsync();
            setIsPlaying(false);
        } else if (soundRef.current) {
            await soundRef.current.playAsync();
            setIsPlaying(true);
        } else {
            // Start from beginning
            playNextAudio(0);
        }
    };

    const handleShareText = async () => {
        try {
            await Share.share({
                message: `آية اليوم 📖\n\n${ayah.text}\n\n${ayah.surahName} – آيات ${ayah.ayahNumber}-${ayah.endAyahNumber}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleShareImage = async () => {
        if (viewShotRef.current && viewShotRef.current.capture) {
            try {
                const uri = await viewShotRef.current.capture();
                if (Platform.OS === 'web') {
                    Alert.alert('تنبيه', 'مشاركة الصور غير مدعومة على الويب');
                    return;
                }
                await Sharing.shareAsync(uri);
            } catch (error) {
                console.error("Snapshot failed", error);
                Alert.alert('خطأ', 'حدث خطأ أثناء مشاركة الصورة');
            }
        }
    };

    const handleShare = () => {
        Alert.alert(
            'مشاركة',
            'كيف تود مشاركة الآيات؟',
            [
                { text: 'كنص', onPress: handleShareText },
                { text: 'كصورة', onPress: handleShareImage },
                { text: 'إلغاء', style: 'cancel' },
            ],
            { cancelable: true }
        );
    };

    return (
        <View style={styles.container}>
            <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.9 }} style={{ backgroundColor: colors.background }}>
                <LinearGradient
                    colors={colors.background === '#020617' ? ['#1e293b', '#0f172a'] : ['#ffffff', '#f8fafc']}
                    style={[styles.card, { borderColor: colors.border }]}
                >
                    <View style={styles.headerRow}>
                        <View style={styles.surahBadge}>
                            <Text style={[styles.surahText, { color: colors.primary }]}>{ayah.surahName}</Text>
                        </View>
                        {ayah.audioUrls && ayah.audioUrls.length > 0 && (
                            <TouchableOpacity onPress={toggleAudio} style={styles.audioButton}>
                                <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={32} color={colors.primary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <Text style={[styles.text, { color: colors.text }]}>
                        {ayah.text}
                    </Text>

                    <View style={styles.footer}>
                        <Text style={[styles.ayahNumber, { color: colors.subtext }]}>
                            الآيات {ayah.ayahNumber} - {ayah.endAyahNumber}
                        </Text>
                    </View>
                </LinearGradient>
            </ViewShot>

            {showActions && (
                <View style={[styles.actionsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={onToggleFavorite}
                    >
                        <Ionicons
                            name={isFavorite ? "star" : "star-outline"}
                            size={24}
                            color={isFavorite ? "#F59E0B" : colors.subtext}
                        />
                        <Text style={[styles.actionText, { color: colors.subtext }]}>مفضلة</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleShare}
                    >
                        <Ionicons name="share-social-outline" size={24} color={colors.subtext} />
                        <Text style={[styles.actionText, { color: colors.subtext }]}>مشاركة</Text>
                    </TouchableOpacity>

                    {ayah.tafseer && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => setShowTafseer(true)}
                        >
                            <Ionicons name="book-outline" size={24} color={colors.subtext} />
                            <Text style={[styles.actionText, { color: colors.subtext }]}>تفسير</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            <Modal
                visible={showTafseer}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowTafseer(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>التفسير الميسر</Text>
                            <TouchableOpacity onPress={() => setShowTafseer(false)}>
                                <Ionicons name="close" size={24} color={colors.subtext} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            <Text style={[styles.tafseerText, { color: colors.text }]}>{ayah.tafseer}</Text>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: 10,
    },
    card: {
        borderRadius: 24,
        padding: 24,
        width: '100%',
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
    },
    surahBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
    },
    surahText: {
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.bold,
    },
    audioButton: {
        padding: 4,
    },
    text: {
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.medium,
        textAlign: 'center',
        lineHeight: 44,
        marginBottom: 24,
    },
    footer: {
        alignItems: 'center',
    },
    ayahNumber: {
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.sm,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 16,
        marginTop: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    actionButton: {
        alignItems: 'center',
        gap: 4,
    },
    actionText: {
        fontFamily: typography.fontFamily,
        fontSize: 10,
        fontWeight: typography.weights.medium,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        height: '60%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
    },
    modalBody: {
        flex: 1,
    },
    tafseerText: {
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.md,
        lineHeight: 28,
        textAlign: 'right',
    },
});
