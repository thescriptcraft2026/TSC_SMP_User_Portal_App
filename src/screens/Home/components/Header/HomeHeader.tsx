import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  useColorScheme,
  Text,
  Platform,
  Dimensions,
  TextInput,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { BlurView } from '@react-native-community/blur';
import { useNavigation } from '@react-navigation/native';

import { themeColors } from '../../../../theme/colors';
import { Fonts } from '../../../../constants/Fonts';
import { useDrawer } from '../../../../components/Drawer/DrawerLayout';
import { useHomeHeaderAnimation } from '../../../../hooks/useHomeHeaderAnimation';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import Bell from '../../../../assets/SVG/Bell';
import FastImage from 'react-native-fast-image';
import Avatar from '../../../../components/Avatar/Avatar';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  headerOffset: Animated.Value;
  activeTab?: string;
  setActiveTab?: React.Dispatch<React.SetStateAction<string>>;
  pagerRef?: any;
  pageOffset?: Animated.Value;
  pagePosition?: Animated.Value;
  pagerScroll?: Animated.Value;
  onActiveTabPress?: () => void;
  showTabs?: boolean;
  notificationCount?: number;
  onTabRefresh?: (tab: string) => void; // Callback for tab refresh
  // NEW
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  placeholder?: string;
  onHeightChange?: (height: number) => void;
};

const { width } = Dimensions.get('window');
const tabs = ['Feed', 'Unfiltered', 'Contest'];
const TAB_WIDTH = Dimensions.get('window').width / tabs.length;
const horizontalPadding = Math.max(10, Math.min(16, width * 0.02));

const HomeHeader = ({
  headerOffset,
  activeTab,
  setActiveTab,
  pagerRef,
  pagerScroll,
  onActiveTabPress,
  showTabs = false,
  notificationCount = 0,
  onTabRefresh,
  searchValue,
  onSearchChange,
  onHeightChange,
  placeholder,
}: Props) => {
  const navigation = useNavigation<any>();
  const isDark = true;
  const { openDrawer } = useDrawer();
  const defaultScrollValue = React.useRef(new Animated.Value(0)).current;
  const { user } = useSelector((state: any) => state.auth);
  const [imageError, setImageError] = useState(false);
  const insets = useSafeAreaInsets();

  const {
    headerTranslate,
    topSectionOpacity,
    topSectionTranslateY,
    blurOpacity,
    // tabIndicatorTranslateX,
    EXPANDED_HEADER_HEIGHT,
  } = useHomeHeaderAnimation(
    headerOffset,
    showTabs ? pagerScroll! : defaultScrollValue,
    showTabs ? TAB_WIDTH : 0,
    showTabs, // ✅ pass this
  );

  const isTabChanging = React.useRef(false);
  const indicatorX = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const index = tabs.indexOf(activeTab || 'Feed');

    Animated.spring(indicatorX, {
      toValue: index * TAB_WIDTH,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  const handleTabPress = (tab: string, index: number) => {
    if (!pagerRef || isTabChanging.current) return;

    if (tab === activeTab) {
      onActiveTabPress?.();
      return;
    }

    isTabChanging.current = true;

    pagerRef.current?.setPage(index);

    setTimeout(() => {
      isTabChanging.current = false;
    }, 250);
  };

  // console.log('user from header', user);

  return (
    <Animated.View
      pointerEvents="box-none"
      onLayout={(e) => {
        onHeightChange?.(e.nativeEvent.layout.height);
      }}

      style={[
        styles.container,
        {
          height: EXPANDED_HEADER_HEIGHT,
          borderColor: '#5b5b5b',
          transform: [{ translateY: headerTranslate }],
        },
      ]}
    >
      {/* BLUR BACKGROUND */}
      {Platform.OS === 'ios' ? (
        <Animated.View
          style={[StyleSheet.absoluteFill, { opacity: blurOpacity }]}
        >
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType={'dark'}
            blurAmount={10}
          />
        </Animated.View>
      ) : (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: blurOpacity,
              backgroundColor: 'rgba(0,0,0,1)',
            },
          ]}
        />
      )}

      {/* TOP HEADER */}
      <Animated.View
        style={[
          styles.wrapper,
          {
            paddingHorizontal: horizontalPadding,
            paddingTop:
              Platform.OS === 'android'
                ? Math.max(insets.top, 8)
                : insets.top,
            opacity: topSectionOpacity,
            transform: [{ translateY: topSectionTranslateY }],
            paddingBottom:
              Platform.OS === 'ios'
                ? (showTabs ? 8 : 10)
                : (showTabs ? 6 : 8),
          },
        ]}
      >
        {/* Avatar */}
        <TouchableOpacity
          style={styles.avatar}
          onPress={openDrawer}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {user?.profile_photo_path ? (
            <Avatar uri={user?.profile_photo_path} size={40} />
          ) : (
            <Avatar name={user?.name} size={40} />
          )}
        </TouchableOpacity>

        {/* Search */}
        {onSearchChange ? (
          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: 'rgba(255,255,255,0.12)',
              },
            ]}
          >
            <TextInput
              style={{
                flex: 1,
                color: '#fff',
                fontSize: 15,
              }}
              value={searchValue}
              onChangeText={onSearchChange}
              placeholder={placeholder || 'Search chats...'}
              placeholderTextColor="#aaa"
            />
            <View
              style={[
                styles.divider,
                {
                  backgroundColor: 'rgba(255,255,255,0.4)',
                },
              ]}
            />
            <TouchableOpacity
              onPress={() => onSearchChange?.('')}
              disabled={!searchValue}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={searchValue ? 'close-circle' : 'search'}
                size={20}
                color={searchValue ? '#fff' : '#fff'}
                style={{ marginLeft: 0 }}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.searchBox,
              {
                backgroundColor: 'rgba(255,255,255,0.12)',
              },
            ]}
            onPress={() => navigation.navigate('Search')}
          >
            <Text style={[styles.searchText, { color: '#aaa' }]}>
              Search . . .
            </Text>

            <View
              style={[
                styles.divider,
                {
                  backgroundColor: 'rgba(255,255,255,0.4)',
                },
              ]}
            />

            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Notification */}

        <TouchableOpacity
          style={styles.vipBtn}
          onPress={() => {
            navigation.navigate('Notification');
          }}
        >
          <Bell size={26} color={themeColors.white} />
          {notificationCount > 0 && (
            <View style={styles.count}>
              <Text style={styles.countText}>
                {notificationCount > 9 ? '9+' : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

      </Animated.View>

      {/* TABS */}
      {showTabs && (
        <View style={styles.tabsContainer}>
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab;

            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, { width: TAB_WIDTH }]}
                activeOpacity={0.8}
                delayPressIn={50}
                onPress={() => handleTabPress(tab, index)}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: isActive ? themeColors.primary : '#aaa',
                    },
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* SLIDER */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.slider,
              {
                width: TAB_WIDTH,
                transform: [{ translateX: indicatorX }]
              },
            ]}
          />
        </View>
      )}
    </Animated.View>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    justifyContent: 'flex-end',
    borderBottomWidth: 0.5,
  },

  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    // paddingHorizontal: 7,
    // paddingBottom: 8,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 100,
    overflow: 'hidden',
    marginRight: 12,
  },

  avaImg: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },

  searchBox: {
    flex: 1,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    paddingHorizontal: 14,
  },

  searchText: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.Regular,
  },

  divider: {
    width: 1,
    height: 18,
    marginHorizontal: 10,
  },

  vipBtn: {
    marginLeft: 12,
    position: 'relative',
  },

  count: {
    position: 'absolute',
    top: -8,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 10,
    backgroundColor: themeColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },

  countText: {
    fontSize: 9,
    color: '#000',
    fontFamily: Fonts.Bold,
  },

  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    height: 30,
    marginTop: 5,
  },

  tab: {
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tabText: {
    fontSize: 15,
    fontFamily: Fonts.SemiBold,
  },

  slider: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    backgroundColor: themeColors.primary,
    borderRadius: 3,
  },
});
