import React, { useState } from 'react';
import {
    ImageBackground,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Dimensions,
} from 'react-native';
import { themeColors } from '../../../theme/colors';
import { Fonts } from '../../../constants/Fonts';
import PrimaryButton from '../../../components/Buttons/PrimaryButton';
import { Controller, useForm } from 'react-hook-form';
import api from '../../../../Instance/Instance';
import { useToast } from '../../../components/Toast/ToastProvider';

const { width } = Dimensions.get('window');

type ContactForm = {
    name: string;
    email: string;
    phone: string;
    message: string;
};

const ContactSection = () => {
    const { show } = useToast()

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<ContactForm>({
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            message: '',
        },
    });


    const onSubmit = async (data: ContactForm) => {
        try {
            const response = await api.post('/contact-form', data);

            if (response.data.success) {
                reset();
                // Show success toast
                show({
                    type: 'success',
                    title: "Contact form submitted successfully!",
                });
            }
        } catch (error) {
            console.log(error);
            show({
                type: 'error',
                title: 'Something went wrong',
            });
        }
    };
    return (
        <ImageBackground
            source={require('../../../assets/images/contact-background.png')}
            style={styles.container}
            imageStyle={styles.image}
            resizeMode="cover">

            <View style={styles.overlay} />
            <View style={styles.content}>
                {/* LEFT */}
                <View style={styles.left}>
                    <View style={styles.badge}>
                        <View style={styles.dot} />
                        <Text style={styles.badgeText}>CONTACT US</Text>
                    </View>

                    <Text style={styles.title}>
                        Have Your Questions Answered!
                    </Text>
                </View>

                {/* RIGHT */}

                <View style={styles.right}>
                    <View style={styles.row}>
                        <View style={styles.half}>
                            <Text style={styles.label}>Full Name *</Text>

                            <Controller
                                control={control}
                                name="name"
                                rules={{
                                    required: 'Name is required',
                                }}
                                render={({ field: { onChange, value } }) => (
                                    <TextInput
                                        value={value}
                                        onChangeText={onChange}
                                        style={styles.input}
                                    />
                                )}
                            />

                            {errors.name && (
                                <Text style={styles.error}>
                                    {errors.name.message}
                                </Text>
                            )}
                        </View>
                        <View style={styles.half}>
                            <Text style={styles.label}>Phone Number *</Text>

                            <Controller
                                control={control}
                                name="phone"
                                rules={{
                                    required: 'Phone number is required',
                                    pattern: {  // Optional: ensure it's a number
                                        value: /^[0-9]+$/,
                                        message: 'Phone must contain only numbers',
                                    },
                                }}
                                render={({ field: { onChange, value } }) => (
                                    <TextInput
                                        value={value}
                                        onChangeText={onChange}
                                        keyboardType="phone-pad"
                                        style={styles.input}
                                        maxLength={10}
                                    />
                                )}
                            />

                            {errors.phone && (
                                <Text style={styles.error}>
                                    {errors.phone.message}
                                </Text>
                            )}
                        </View>
                    </View>

                    <Text style={styles.label}>Email Address *</Text>

                    <Controller
                        control={control}
                        name="email"
                        rules={{
                            required: 'Email is required',
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Invalid email format',
                            },
                        }}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                value={value}
                                onChangeText={onChange}
                                keyboardType="email-address"
                                style={styles.input}
                            />
                        )}
                    />

                    {errors.email && (
                        <Text style={styles.error}>
                            {errors.email.message}
                        </Text>
                    )}

                    <Text style={styles.label}>How Can We Help You *</Text>

                    <Controller
                        control={control}
                        name="message"
                        rules={{
                            required: 'Message is required',
                        }}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                value={value}
                                multiline
                                textAlignVertical="top"
                                onChangeText={onChange}
                                style={styles.message}
                            />
                        )}
                    />

                    {errors.message && (
                        <Text style={styles.error}>
                            {errors.message.message}
                        </Text>
                    )}
                    <PrimaryButton
                        title={isSubmitting ? 'Sending...' : 'Send Message'}
                        onPress={handleSubmit(onSubmit)}
                    />

                </View>

            </View>
        </ImageBackground>
    );
};

export default ContactSection;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingVertical: 70,
    },

    image: {
        borderRadius: 20,
    },

    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,.72)',
        borderRadius: 20,
    },

    content: {
        flexDirection: width > 768 ? 'row' : 'column',
        paddingHorizontal: 30,
    },

    left: {
        flex: 1,
        justifyContent: 'center',
    },

    right: {
        flex: 1,
    },

    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
    },

    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FDB913',
        marginRight: 10,
    },

    badgeText: {
        color: '#fff',
        letterSpacing: 1,
        fontSize: 14,
    },

    title: {
        fontSize: 42,
        color: '#fff',
        fontFamily: Fonts.Bold
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    half: {
        width: '48%',
    },

    label: {
        color: '#fff',
        marginBottom: 4,
        fontSize: 14,
        fontFamily:Fonts.Regular
    },

    input: {
        height: 42,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: themeColors.gray,
        backgroundColor: '#171717',
        paddingHorizontal: 16,
        color: '#fff',
        marginBottom: 20,
        fontFamily:Fonts.Regular
    },

    message: {
        height: 150,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: themeColors.gray,
        backgroundColor: '#171717',
        padding: 16,
        color: '#fff',
        marginBottom: 28,
    },

    button: {
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FDB913',
        justifyContent: 'center',
        alignItems: 'center',
    },

    buttonText: {
        fontWeight: '700',
        color: '#000',
        fontSize: 18,
    },

    error: {
        color: '#ff4d4f',
        fontSize: 12,
        marginTop: -15,
        marginBottom: 12,
        fontFamily: Fonts.Medium,
    },
});