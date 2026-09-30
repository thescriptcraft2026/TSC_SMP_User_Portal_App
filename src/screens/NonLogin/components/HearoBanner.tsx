import React from 'react';
import {
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../../constants/Fonts';
import ArrowUpRight from '../../../assets/SVG/ArrowUpRight';


type HeroBannerProps = {
    onGetStarted?: () => void;
};

const HeroBanner = ({ onGetStarted }: HeroBannerProps) => {
    return (
        <ImageBackground
            source={require('../../../assets/images/brightend_image_under_1mb.webp')}
            style={styles.container}
            resizeMode="cover">

            {/* Dark Overlay */}
            <View style={styles.overlay} />

            {/* Left → Right Gradient */}
            <LinearGradient
                colors={[
                    'rgba(0,0,0,0.75)',
                    'rgba(0,0,0,0.35)',
                    'rgba(0,0,0,0.75)',
                ]}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.content}>

                {/* Badge */}
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                        ✨ AI-Powered Platform for Smart Industry Connections
                    </Text>
                </View>

                {/* Heading */}

                <Text style={styles.title}>
                    Make Your Mark{'\n'}
                    Real Talent,
                    Real Stories,{'\n'}
                    <Text style={styles.highlight}>
                        Endless Possibilities
                    </Text>
                </Text>

                {/* Description */}

                <Text style={styles.description}>
                    Showcase your profile, connect with filmmakers, discover projects, and unlock real opportunities across the movie industry — all in one powerful platform.
                </Text>

                {/* Button */}

                <TouchableOpacity style={styles.button} activeOpacity={0.9}
                    onPress={onGetStarted}>

                    <Text style={styles.buttonText}>
                        Get Started
                    </Text>

                    <ArrowUpRight size={18} />

                </TouchableOpacity>

            </View>

        </ImageBackground>
    );
};

export default HeroBanner;

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        paddingVertical: 50
    },

    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },

    content: {
        alignItems: 'center',
        paddingHorizontal: 25,
    },

    badge: {
        paddingHorizontal: 18,
        paddingVertical: 6,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        backgroundColor: 'rgba(0,0,0,0.45)',
        marginBottom: 10,
    },

    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontFamily: Fonts.Bold
    },

    title: {
        fontSize: 30,
        fontFamily: Fonts.Bold,
        color: '#fff',
        textAlign: 'center',
    },

    highlight: {
        color: '#F6A800',
    },

    description: {
        marginTop: 18,
        color: '#F3F3F3',
        fontSize: 18,
        textAlign: 'center',
        // width: '88%',
        fontFamily: Fonts.Regular
    },

    button: {
        marginTop: 20,
        backgroundColor: '#F6A800',
        borderRadius: 40,
        paddingHorizontal: 28,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    buttonText: {
        fontSize: 17,
        color: '#000',
        fontFamily: Fonts.Bold
    },
});