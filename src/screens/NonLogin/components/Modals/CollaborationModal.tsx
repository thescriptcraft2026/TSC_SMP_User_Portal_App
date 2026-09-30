import React, { useEffect, useRef, useState } from 'react';
import {
    Modal,
    Animated,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Pressable,
    Platform,
    Keyboard,
    KeyboardAvoidingView,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';

import { themeColors } from '../../../../theme/colors';
import { Fonts } from '../../../../constants/Fonts';
import PrimaryButton from '../../../../components/Buttons/PrimaryButton';
import FloatingInputTwo from '../../../../components/Input/FloatingInputTwo';

const ChangeEmailModal = ({
    visible,
    onClose,
}: any) => {
    const slideAnim = useRef(new Animated.Value(350)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const isDark = true;
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    const [loading, setLoading] = useState(false);

    // ================= ANIMATION =================

    useEffect(() => {
        if (visible) {
            slideAnim.setValue(350);
            fadeAnim.setValue(0);



            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    damping: 18,
                    stiffness: 180,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 350,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    useEffect(() => {
        const show = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            () => setKeyboardVisible(true),
        );

        const hide = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => setKeyboardVisible(false),
        );

        return () => {
            show.remove();
            hide.remove();
        };
    }, []);
    // ================= RETURN =================

    return (
        <Modal transparent visible={visible} animationType="none">
            <Pressable
                style={StyleSheet.absoluteFill}
                onPress={() => {
                    if (keyboardVisible) {
                        Keyboard.dismiss();
                    } else if (!loading) {
                        onClose();
                    }
                }}
            >
                <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
            </Pressable>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 5 : 0}
            >
                <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                    <Animated.View
                        style={[
                            styles.sheet,
                            {
                                transform: [{ translateY: slideAnim }],
                                backgroundColor: isDark
                                    ? themeColors.background
                                    : themeColors.white,
                            },
                        ]}
                    >
                        <TouchableOpacity
                            style={styles.closeIcon}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <Feather name="x" size={23} color={isDark ? '#fff' : '#000'} />
                        </TouchableOpacity>

                        <View style={styles.handle} />

                        <View style={styles.header}>
                            <Text
                                style={[
                                    styles.title,
                                    {
                                        color: isDark ? themeColors.white : themeColors.text,
                                    },
                                ]}
                            >
                               Collaborate With Us
                            </Text>
                        </View>

                        <FloatingInputTwo
                            label="Name"
                            value={""}
                            onChangeText={() => { }}
                        />
                     
                        <FloatingInputTwo
                            label="Contact Number"
                            value={""}
                            onChangeText={() => { }}
                            keyboardType="email-address"
                        />
                           <FloatingInputTwo
                            label="Contact Email"
                            value={""}
                            onChangeText={() => { }}
                            keyboardType="email-address"
                        />
                           <FloatingInputTwo
                            label="Profession / Company Brief"
                            value={""}
                            onChangeText={() => { }}
                            keyboardType="email-address"
                        />
                           <FloatingInputTwo
                            label="Subject"
                            value={""}
                            onChangeText={() => { }}
                            keyboardType="email-address"
                        />
                           <FloatingInputTwo
                            label="Description"
                            value={""}
                            onChangeText={() => { }}
                            keyboardType="email-address"
                            multiline
                            height={120}
                        />

                        <PrimaryButton
                            title={loading ? 'Sending...' : 'Send OTP'}
                            onPress={() => { }}
                            loading={loading}
                        />

                    </Animated.View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default ChangeEmailModal;

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },

    sheet: {
        marginHorizontal: 8,
        marginBottom: Platform.OS === 'ios' ? 5 : 5,

        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,

        borderBottomLeftRadius: Platform.OS === 'ios' ? 50 : 20,
        borderBottomRightRadius: Platform.OS === 'ios' ? 50 : 20,

        paddingHorizontal: 22,
        paddingTop: 10,
        paddingBottom: 24,
    },

    closeIcon: {
        position: 'absolute',
        top: 14,
        right: 10,
        zIndex: 20,

        backgroundColor: `${String(themeColors.primary)}15`,
        padding: 5,
        borderRadius: 100,
    },

    handle: {
        width: 32,
        height: 5,
        backgroundColor: '#ccc',
        borderRadius: 4,
        alignSelf: 'center',
        marginBottom: 16,
    },

    header: {
        // alignItems: 'center',
        marginBottom: 20,
    },

    title: {
        fontSize: 22,
        fontFamily: Fonts.Bold,
    },

    subtitle: {
        fontSize: 14,
        // textAlign: 'center',
        color: '#999',
        fontFamily: Fonts.Regular,
    },

    successContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },

    successIcon: {
        width: 70,
        height: 70,
        borderRadius: 100,
        // backgroundColor: themeColors.primary,

        justifyContent: 'center',
        alignItems: 'center',

        marginBottom: 18,
    },

    otpBox: {
        width: 45,
        height: 45,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: '#ccc',
    },

    otpText: {
        fontSize: 20,
        fontFamily: Fonts.Bold,
        color: themeColors.primary,
    },
});
