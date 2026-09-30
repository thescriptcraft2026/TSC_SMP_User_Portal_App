import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme, // ✅ ADD
} from 'react-native';
import { Portal } from 'react-native-paper';
import Ionicons from '@react-native-vector-icons/ionicons';
import Minus from '../../assets/SVG/Minus';
import Block from '../../assets/SVG/Block';
import Flag from '../../assets/SVG/Flag';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import Trash from '../../assets/SVG/Trash';
import EditTwo from '../../assets/SVG/EditTwo';

type Props = {
  visible: boolean;
  x: number;
  y: number;
  onClose: () => void;

  onReport?: () => void;
  onNotInterested?: () => void;
  isReported?: boolean; // ✅ NEW
  isOwnPost?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
};

const PostMenu = ({
  visible,
  x,
  y,
  onClose,
  onReport,
  onNotInterested,
  isReported = false,
  isOwnPost = false,
  onDelete,
  onEdit,
}: Props) => {
  const isDark = true; // ✅ ADD

  if (!visible) return null;

  return (
    <Portal>
      <TouchableOpacity
        style={[
          styles.overlay,
          {
            backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)', // ✅ subtle backdrop
          },
        ]}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[
            styles.menu,
            {
              top: y,
              right: x,
              backgroundColor: isDark ? '#1c1c1e' : '#fff', // ✅ theme bg
            },
          ]}
        >
          {/* EDIT */}
          {!!isOwnPost && (
            <TouchableOpacity
              style={[styles.item]}
              onPress={() => {
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
              <Text style={[styles.text, { color: themeColors.white }]}>
                Delete
              </Text>
            </TouchableOpacity>
          )}

          {!!isOwnPost === false && (
            <TouchableOpacity
              style={styles.item}
              disabled={!!isReported} // ✅ DISABLE CLICK
              onPress={() => {
                if (isReported) return; // safety
                onReport?.();
                onClose();
              }}
            >
              <Flag size={16} color={isReported ? '#999' : themeColors.white} />
              <Text
                style={[
                  styles.text,
                  {
                    color: isReported
                      ? '#999' // grey disabled
                      : isDark
                      ? themeColors.white
                      : themeColors.black,
                  },
                ]}
              >
                {isReported ? 'Already Reported' : 'Report Post'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Portal>
  );
};

export default PostMenu;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },

  menu: {
    position: 'absolute',
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    elevation: 5,
    overflow: 'hidden',
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  text: {
    fontSize: 11,
    fontFamily: Fonts.SemiBold,
  },
});
