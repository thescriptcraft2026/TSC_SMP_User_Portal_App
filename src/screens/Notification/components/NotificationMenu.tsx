import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Portal } from 'react-native-paper';
import Ionicons from '@react-native-vector-icons/ionicons';
import { themeColors } from '../../../theme/colors';
import { Fonts } from '../../../constants/Fonts';

type Props = {
  visible: boolean;
  x: number;
  y: number;
  onClose: () => void;

  isRead?: boolean;
  onMarkAsRead?: () => void;
  onDelete?: () => void;
};

const NotificationMenu = ({
  visible,
  x,
  y,
  onClose,
  isRead,
  onMarkAsRead,
  onDelete,
}: Props) => {
  const isDark = true;

  if (!visible) return null;

  return (
    <Portal>
      <TouchableOpacity
        style={[
          styles.overlay,
          {
            backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)',
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
              backgroundColor: themeColors.card,
            },
          ]}
        >
          {/* MARK AS READ */}
          {!isRead && (
            <TouchableOpacity
              style={styles.item}
              onPress={() => {
                onMarkAsRead?.();
                onClose();
              }}
            >
              <Ionicons
                name="checkmark-done"
                size={16}
                color={isDark ? themeColors.white : themeColors.black}
              />
              <Text style={[styles.text, { color: isDark ? '#fff' : '#000' }]}>
                Mark as read
              </Text>
            </TouchableOpacity>
          )}

          {/* DELETE */}
          <TouchableOpacity
            style={styles.item}
            onPress={() => {
              onDelete?.();
              onClose();
            }}
          >
            <Ionicons name="trash" size={16} color={themeColors.red} />
            <Text style={[styles.text, { color: themeColors.red }]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Portal>
  );
};

export default NotificationMenu;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    width: 160,
    borderRadius: 10,
    paddingVertical: 6,
    elevation: 5,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  text: {
    fontSize: 13,
    fontFamily: Fonts.SemiBold,
  },
});
