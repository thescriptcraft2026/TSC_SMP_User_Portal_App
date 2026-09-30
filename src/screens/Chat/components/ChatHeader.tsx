import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Platform,
} from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { useRoute } from '@react-navigation/native';
import { themeColors } from '../../../theme/colors';
import { Fonts } from '../../../constants/Fonts';
import Avatar from '../../../components/Avatar/Avatar';
import Ionicons from '@react-native-vector-icons/ionicons';
import PostMenu from '../../../components/DropDown/PostMenu';
import { responsiveFont, responsiveHeight, responsiveWidth } from '../../../utils/responsive';

interface AuthHeaderProps {
  title?: string;
  onBack?: () => void;
  showBack?: boolean;
  fontSize?: number;
  transparent?: boolean;
  style?: any;
  uri?: any;
  name?: any;
  is_online?: any;
  subtitle?: any;
  showMenu?: boolean;
  onReport?: () => void;
  isAlreadyReported?: boolean;
  handleProfile?: () => void;
}

const ChatHeader: React.FC<AuthHeaderProps> = ({
  title,
  onBack,
  showBack = true,
  fontSize = responsiveFont(20),
  transparent = false,
  style,
  uri,
  name,
  is_online,
  subtitle,
  showMenu = false,
  onReport,
  isAlreadyReported = false,
  handleProfile,
}) => {
  const isDark = true;
  const noRightActions = !showMenu;
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const openMenu = (event: any) => {
    const { pageX, pageY } = event.nativeEvent;

    setMenuPosition({
      x: pageX,
      y: pageY,
    });

    setMenuVisible(true);
  };

  return (
    <>
      <View
        style={[
          styles.header,
          style,
          {
            marginTop: Platform.OS === 'android' ? 7 : 0,
            position: transparent ? 'absolute' : 'relative', // 🔥
            top: transparent ? 0 : undefined,
            left: transparent ? 0 : undefined,
            right: transparent ? 0 : undefined,
            zIndex: transparent ? 10 : 1,
          },
        ]}
      >
        {/* LEFT */}
        {showBack && (
          <TouchableOpacity
            style={[
              styles.backButton,
              {
                backgroundColor: transparent
                  ? 'rgba(0,0,0,0.4)' // 🔥 glass effect
                  : isDark
                  ? '#1E1E1E'
                  : themeColors.white,
              },
            ]}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <FontAwesome6
              name="arrow-left"
              size={responsiveFont(18)}
              color={transparent ? '#fff' : isDark ? themeColors.white : '#333'}
              iconStyle="solid"
            />
          </TouchableOpacity>
        )}

        <View style={{ marginLeft: 10 }}>
          <Avatar uri={uri} name={name} size={responsiveWidth(9)} />
        </View>

        <TouchableOpacity onPress={handleProfile}>
          {/* TITLE */}
          <Text
            style={[
              styles.headerTitle,
              {
                fontSize,
                color: transparent
                  ? '#fff'
                  : isDark
                  ? themeColors.white
                  : themeColors.black,
                marginLeft: showBack ? 10 : 0,
                textAlign: noRightActions ? 'center' : 'left',
              },
            ]}
            numberOfLines={1}
            ellipsizeMode='tail'
          >
            {title}
          </Text>
        </TouchableOpacity>

        {/* RIGHT ACTIONS */}
        <View style={styles.rightContainer}>
          {/* MENU */}
          {showMenu && (
            <TouchableOpacity onPress={openMenu} style={styles.iconBtn}>
              <Ionicons
                name="ellipsis-vertical"
                size={responsiveFont(18)}
                color={
                  transparent
                    ? '#fff'
                    : isDark
                    ? themeColors.white
                    : themeColors.black
                }
              />
            </TouchableOpacity>
          )}
        </View>
        {noRightActions && showBack && <View style={{ width: 40 }} />}
      </View>
      {/* MENU */}
      {showMenu && (
        <PostMenu
          visible={menuVisible}
          x={menuPosition.x}
          y={menuPosition.y}
          onClose={() => setMenuVisible(false)}
          onReport={() => {
            setMenuVisible(false);
            onReport?.();
          }}
          isAlreadyReported={isAlreadyReported}
        />
      )}
    </>
  );
};

export default ChatHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(3),
    paddingBottom: responsiveHeight(0.8),
      minHeight: responsiveHeight(6), // or 60
  },

  headerTitle: {
    // flex: 1,
    fontFamily: Fonts.Bold,
    maxWidth: responsiveWidth(50),
  },

  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },

  iconBtn: {
    padding: responsiveWidth(1.8),
    marginLeft: responsiveWidth(1),
    backgroundColor: themeColors.card2,
    borderRadius: responsiveWidth(10),
  },

  backButton: {
    width: responsiveWidth(10),
    height: responsiveWidth(10),
    borderRadius: responsiveWidth(5),
    justifyContent: 'center',
    alignItems: 'center',
  },

  markReadText: {
    fontFamily: Fonts.Regular,
    fontSize: responsiveFont(10),
  },

  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: responsiveWidth(3),
    height: responsiveWidth(3),
    borderRadius: responsiveWidth(1.5),
    borderWidth: 2,
    borderColor: '#fff',
  },
});
