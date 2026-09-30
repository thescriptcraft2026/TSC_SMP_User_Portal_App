import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme, // ✅ ADD
} from 'react-native';
import { Portal } from 'react-native-paper';
import Block from '../../../assets/SVG/Block';
import { themeColors } from '../../../theme/colors';
import Flag from '../../../assets/SVG/Flag';
import { Fonts } from '../../../constants/Fonts';
import Share from '../../../assets/SVG/Share';
import Ionicons from '@react-native-vector-icons/ionicons';

type Props = {
  visible: boolean;
  x: number;
  y: number;
  onClose: () => void;

  onReport?: () => void;
  handleRemoveConnection?: () => void;
  status?: string;
  handleBlock?: () => void;
  isBlocked?: any;
  handleReportUser?: () => void;
  handleShare?: () => void;
};

const MenuOption = ({
  visible,
  x,
  y,
  onClose,
  handleRemoveConnection,
  status,
  handleBlock,
  isBlocked,
  handleReportUser,
  handleShare,
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
          {status === 'accepted' && (
            <TouchableOpacity
              style={styles.item}
              onPress={handleRemoveConnection}
            >
              <Block
                size={16}
                color={isDark ? themeColors.white : themeColors.black}
              />
              <Text
                style={[
                  styles.text,
                  { color: isDark ? themeColors.white : themeColors.black }, // ✅ text color
                ]}
              >
                Remove Connection
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.item}
            onPress={() => {
              handleBlock?.();
              onClose();
            }}
          >
            <Ionicons
              name={isBlocked ? 'lock-open' : 'ban'}
              size={18}
              color={isBlocked ? themeColors.green : themeColors.red}
            />

            <Text
              style={[
                styles.text,
                {
                  color: isDark ? themeColors.white : themeColors.black,
                },
              ]}
            >
              {isBlocked ? 'UnBlock' : 'Block'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => {
              handleReportUser?.();
              onClose();
            }}
          >
            <Flag
              size={16}
              color={isDark ? themeColors.white : themeColors.black}
            />
            <Text
              style={[
                styles.text,
                { color: isDark ? themeColors.white : themeColors.black },
              ]}
            >
              Report
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => {
              handleShare?.();
              onClose();
            }}
          >
            <Share
              size={16}
              color={isDark ? themeColors.white : themeColors.black}
            />
            <Text
              style={[
                styles.text,
                { color: isDark ? themeColors.white : themeColors.black },
              ]}
            >
              Share
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Portal>
  );
};

export default MenuOption;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },

  menu: {
    position: 'absolute',
    width: 150,
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
    paddingVertical: 2,
    marginBottom: 8,
  },

  text: {
    fontSize: 11,
    fontFamily: Fonts.SemiBold,
  },
});
