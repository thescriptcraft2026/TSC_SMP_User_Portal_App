import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  useColorScheme, // ✅ ADD
} from 'react-native';
import { Portal } from 'react-native-paper';

import Block from '../../assets/SVG/Block';
import Flag from '../../assets/SVG/Flag';
import EditTwo from '../../assets/SVG/EditTwo';
import { themeColors } from '../../theme/colors';
import Trash from '../../assets/SVG/Trash';

type Props = {
  visible: boolean;
  x: number;
  y: number;
  onClose: () => void;

  bookmarked?: boolean;
  onToggleBookmark?: () => void;

  onEdit?: () => void;
  onReport?: () => void;
  onNotInterested?: () => void;
  isOwnPost?: boolean;
  isAlreadyReported?: boolean;
  onDelete?: () => void;
  isSubmissionThere?: boolean;
  type?:any
};

const PostMenu = ({
  visible,
  x,
  y,
  onClose,
  bookmarked,
  onToggleBookmark,
  onEdit,
  onReport,
  onNotInterested,
  isAlreadyReported,
  isOwnPost,
  onDelete,
  isSubmissionThere,
  type
}: Props) => {
  const isDark = true; // ✅ ADD

  if (!visible) return null;
  const hasSubmissions = !!isSubmissionThere;

  return (
    <Portal>
      {/* Overlay */}
      <Pressable
        style={[
          styles.overlay,
          {
            backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)', // ✅ subtle dim
          },
        ]}
        onPress={onClose}
      >
        {/* Menu */}
        <View
          style={[
            styles.menu,
            {
              top: y,
              right: 10,
              backgroundColor: isDark ? '#1c1c1e' : '#fff', // ✅ theme bg
            },
          ]}
        >
          {/* EDIT */}
          {isOwnPost && (
            <TouchableOpacity
              disabled={hasSubmissions}
              style={[styles.item, hasSubmissions && { opacity: 0.4 }]}
              onPress={() => {
                if (hasSubmissions) return; // 🔥 extra safety
                onEdit?.();
                onClose();
              }}
            >
              <EditTwo
                size={16}
                color={isDark ? themeColors.white : themeColors.black}
              />
              <Text
                style={[
                  styles.text,
                  { color: isDark ? themeColors.white : themeColors.black },
                ]}
              >
                Edit
              </Text>
            </TouchableOpacity>
          )}

          {/* Delete */}
          {isOwnPost && (
            <TouchableOpacity
              style={styles.item}
              onPress={() => {
                onDelete?.();
                onClose();
              }}
            >
              <Trash
                size={16}
                color={isDark ? themeColors.red : themeColors.red}
              />
              <Text
                style={[
                  styles.text,
                  { color: isDark ? themeColors.red : themeColors.red },
                ]}
              >
                Delete
              </Text>
            </TouchableOpacity>
          )}

          {/* NOT INTERESTED */}
          {/* {!isOwnPost && (
            <TouchableOpacity
              style={styles.item}
              onPress={() => {
                onNotInterested?.();
                onClose();
              }}
            >
              <Block size={16} color={isDark ? '#fff' : themeColors.red} />
              <Text style={[styles.text, { color: isDark ? '#fff' : '#000' }]}>
                Not Interested
              </Text>
            </TouchableOpacity>
          )} */}

          {/* REPORT */}
          {!isOwnPost && (
            <TouchableOpacity
              disabled={!!isAlreadyReported}
              style={[
                styles.item,
                !!isAlreadyReported && { opacity: 0.4 }, // 🔥 disabled look
              ]}
              onPress={() => {
                if (isAlreadyReported) return;

                onReport?.();
                onClose();
              }}
            >
              <Flag size={16} color={themeColors.white} />
              <Text style={[styles.text, { color: themeColors.white }]}>
                {isAlreadyReported ? 'Reported' : `Report ${type}`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Pressable>
    </Portal>
  );
};

export default PostMenu;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  menu: {
    position: 'absolute',
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 6,
    elevation: 6,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  text: {
    fontSize: 12,
  },
});
