import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ImageViewerScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    const { images, index } = route.params;

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', "top"]}>
            <ImageViewer
                imageUrls={images.map((item: any) => ({
                    url: item.url,
                }))}
                index={index}
                // enableSwipeDown
                onSwipeDown={() => navigation.goBack()}
                enablePreload
            />

            <TouchableOpacity
                style={styles.close}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    close: {
        position: 'absolute',
        top: 50,
        right: 20,
    },
});

export default ImageViewerScreen;