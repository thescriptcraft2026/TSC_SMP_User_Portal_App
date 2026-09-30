import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import ArrowUpRight from '../../../assets/SVG/ArrowUpRight';
import { Fonts } from '../../../constants/Fonts';
import { themeColors } from '../../../theme/colors';

const DATA = [
    {
        white: 'WRITE & DE',
        gray: 'VELOP',
        action: 'write',
        desc: "Powerful tools to bring your ideas to life."
    },
    {
        white: 'COLLAB',
        gray: 'ORATE',
        action: 'collaborate',
        desc: "Connect with us to collaborate."
    },
    {
        white: 'GET',
        gray: ' DISCOVERED',
        action: 'discover',
        desc: "Showcase your work to the right audience."
    },
];

const Collaborate = () => {
    const navigation = useNavigation<any>();
    return (
        <>
            <View style={styles.container}>
                {DATA.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        activeOpacity={0.85}
                        style={styles.row}
                        onPress={() => {
                            if (item.action === 'collaborate') {
                                navigation.navigate("CollaborateForm")
                            } else if (item?.action === "write") {
                                navigation.navigate('BottomTab', {
                                    screen: 'Feed',
                                });

                            } else if (item?.action === "discover") {
                                navigation.navigate('BottomTab', {
                                    screen: 'Feed',
                                });
                            }
                        }}
                    >
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>
                                <Text style={styles.white}>{item.white}</Text>
                                <Text style={styles.gray}>{item.gray}</Text>
                            </Text>
                            <Text style={styles.description}>{item.desc}</Text>
                        </View>

                        <View style={{ backgroundColor: themeColors.input, borderRadius: 100, padding: 10 }}>
                            <ArrowUpRight size={22} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </>
    );
};

export default Collaborate;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#111111',
        borderTopWidth: 1,
        borderTopColor: '#2B2B2B',
        borderBottomWidth: 1,
        borderBottomColor: '#2B2B2B',
    },

    row: {
        minHeight: 80,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        paddingHorizontal: 28,

        borderBottomWidth: 1,
        borderBottomColor: '#2B2B2B',
    },

    textContainer: {
        flex: 1,
    },

    title: {
        fontSize: 36,
        fontFamily: Fonts.Bold,
        letterSpacing: -1,
    },

    white: {
        color: themeColors.white,
    },

    gray: {
        color: themeColors.white,
    },
    description: {
        fontSize: 12,
        fontFamily: Fonts.Regular,
        color: themeColors.gray,
    },
});