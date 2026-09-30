import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import FastImage from 'react-native-fast-image';
import { pick, types, isErrorWithCode } from '@react-native-documents/picker';

import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';

export type FileType = {
  uri: string;
  type?: string | any;
  fileName?: string | any;
  fileSize?: number | any;
};

type Props = {
  file: FileType | null;
  onChange: (file: FileType | null) => void;
  error?: string;
  maxSizeMB?: number;
  onError?: (message: string) => void;
};

const FileUploader = ({
  file,
  onChange,
  error,
  maxSizeMB = 10,
  onError,
}: Props) => {
  const [loading, setLoading] = useState(false);

  const pickFile = async () => {
    try {
      const [selected] = await pick({
        allowMultiSelection: false,
        type: [types.pdf, types.images],
      });

      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      if ((selected.size ?? 0) > maxSizeBytes) {
        onError?.(`File size must be below ${maxSizeMB}MB`);
        return;
      }

      setLoading(true);

      setTimeout(() => {
        onChange({
          uri: selected.uri,
          fileName: selected.name,
          type: selected.type,
          fileSize: selected.size,
        });

        setLoading(false);
      }, 300);
    } catch (e) {
      if (!isErrorWithCode(e)) {
        console.log(e);
      }
    }
  };

  return (
    <View style={styles.container}>
      {file && (
        <View style={styles.preview}>
          {file.type?.startsWith('image') ? (
            <FastImage
              source={{ uri: file.uri }}
              style={styles.image}
              resizeMode={FastImage.resizeMode.cover}
            />
          ) : (
            <View style={styles.pdfPreview}>
              <Ionicons
                name="document-text"
                size={40}
                color={themeColors.primary}
              />
              <Text style={styles.fileName} numberOfLines={2}>
                {file.fileName}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => onChange(null)}
          >
            <Ionicons name="close" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {!file && (
        <TouchableOpacity
          style={styles.uploadBox}
          activeOpacity={0.8}
          onPress={pickFile}
        >
          <Ionicons
            name="document-attach-outline"
            size={34}
            color={themeColors.primary}
          />

          <Text style={styles.title}>
            {loading ? 'Uploading...' : 'Upload Resume / Image'}
          </Text>

          <Text style={styles.subtitle}>PDF, JPG, PNG</Text>

          <Text style={styles.subtitle}>Max {maxSizeMB}MB</Text>
        </TouchableOpacity>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

export default FileUploader;

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },

  uploadBox: {
    height: 140,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: themeColors.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
  },

  title: {
    marginTop: 10,
    fontFamily: Fonts.Bold,
    fontSize: 14,
    color: '#fff',
  },

  subtitle: {
    marginTop: 4,
    color: '#999',
    fontSize: 12,
  },

  preview: {
    width: '100%',
    height: 140,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#1c1c1e',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  pdfPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },

  fileName: {
    marginTop: 10,
    color: '#fff',
    textAlign: 'center',
    fontSize: 12,
  },

  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  error: {
    marginTop: 6,
    color: '#ff4d4f',
    fontSize: 12,
  },
});
