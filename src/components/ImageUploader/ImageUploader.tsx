import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import FastImage from 'react-native-fast-image';
import Ionicons from '@react-native-vector-icons/ionicons';
import { launchImageLibrary } from 'react-native-image-picker';

import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';

export type ImageType = {
  uri: string;
  type?: string;
  fileName?: string;
  fileSize?: number;
};

type Props = {
  images: ImageType[];
  onChange: (images: ImageType[]) => void;
  maxImages?: number;
  error?: string | any;
  maxSizeMB?: number;
  onError?: (message: string) => void;
};

const ImageUploader = ({
  images,
  onChange,
  maxImages = 10,
  error,
  maxSizeMB = 10,
  onError,
}: Props) => {
  const isDark = true;
  const [loading, setLoading] = useState(false);

  const pickImages = async () => {
    const remaining = maxImages - images.length;

    const res = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: remaining,
      quality: 0.8,
    });

    if (!res.assets) {
      return;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    const oversized = res.assets.find(
      asset => (asset.fileSize || 0) > maxSizeBytes,
    );

    if (oversized) {
      const message = `Image size must be below ${maxSizeMB}MB`;

      onError?.(message);
      return;
    }

    const selectedImages = res.assets.map(asset => ({
      uri: asset.uri!,
      type: asset.type || 'image/jpeg',
      fileName: asset.fileName || `image_${Date.now()}.jpg`,
      fileSize: asset.fileSize,
    }));

    setLoading(true);

    setTimeout(() => {
      onChange([...images, ...selectedImages]);
      setLoading(false);
    }, 500);
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <View style={styles.wrapper}>
      {/* Images */}
      {images.length > 0 && (
        <View style={styles.imageGrid}>
          {images.map((item, index) => (
            <View key={`${item.uri}-${index}`} style={styles.imageCard}>
              <FastImage
                source={{ uri: item.uri }}
                style={styles.image}
                resizeMode={FastImage.resizeMode.cover}
              />

              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeImage(index)}
              >
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Upload Box */}
      {images.length < maxImages && (
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.dropArea,
            {
              borderColor: themeColors.primary,
              backgroundColor: isDark ? '#1c1c1e' : '#fafafa',
            },
          ]}
          onPress={pickImages}
        >
          {loading ? (
            <Text style={styles.uploadText}>Uploading...</Text>
          ) : (
            <>
              <Ionicons
                name="cloud-upload-outline"
                size={30}
                color={themeColors.primary}
              />

              <Text style={styles.uploadText}>Tap to upload {maxImages > 1 ? "images" : "image"}</Text>

              <Text style={styles.uploadSub}>PNG, JPG, WebP</Text>
              <Text style={styles.uploadSub}>
                Up to {maxImages} {maxImages > 1 ? "images" : "image"} • Max {maxSizeMB}MB {maxImages > 1 ? "each" : ""}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

export default ImageUploader;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
  },

  dropArea: {
    height: 140,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },

  uploadText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: Fonts.Bold,
    color: '#666',
  },

  uploadSub: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },

  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },

  imageCard: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorText: {
    color: '#ff4d4f',
    marginTop: 6,
    fontSize: 12,
    marginLeft: 4,
  },
});
