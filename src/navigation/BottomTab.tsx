import React, {
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  useColorScheme,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/Home/HomeScreen';
import { themeColors } from '../theme/colors';
import ChatListScreen from '../screens/Chat/ChatListScreen';
import { Fonts } from '../constants/Fonts';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import Book from '../assets/SVG/Book';
import Synoposys from '../assets/SVG/Synoposys';
import VisionX from '../assets/SVG/VisionX';
import Oppurtunity from '../assets/SVG/Oppurtunity';
import Users from '../assets/SVG/Users';
import Chat from '../assets/SVG/Chat';
import Home from '../assets/SVG/Home';
import Post from '../assets/SVG/Post';
import Connections from '../screens/connection/Connections';
import StaticScreen from '../screens/NonLogin/StaticScreen';
import Feed from '../assets/SVG/Feed';
import { responsiveFont, responsiveWidth } from '../utils/responsive';

export const tabBarScrollY = new Animated.Value(0);

const Tab = createBottomTabNavigator();

const fabOptions = [
  { label: 'Post', icon: Post, color: '#FF4D4F', route: 'AddPost' },
  {
    label: 'Opportunities',
    icon: Oppurtunity,
    color: '#8e51ff',
    route: 'AddOpportunity',
  },
  {
    label: 'Synopses',
    icon: Synoposys,
    color: '#00bc7d',
    route: 'AddSynopsis',
  },
  {
    label: 'Creators Zone',
    icon: VisionX,
    color: '#00b8db',
    route: 'AddVisionX',
  },

  { label: 'Books', icon: Book, color: '#f0b100', route: 'AddBook' },
];

function CustomTabBar({ state, navigation, tabCount, bottomInset = 0 }: any) {
  useEffect(() => {
    Animated.spring(tabBarScrollY, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }, [state.index]);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const tabLayouts = useRef<{ x: number; width: number }[]>([]);
  const [layoutReady, setLayoutReady] = useState(false);

  const translateX = useRef(new Animated.Value(0)).current;
  const bubbleWidth = useRef(new Animated.Value(0)).current;

  const [open, setOpen] = React.useState(false);

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const optionAnim = useRef(new Animated.Value(0)).current;

  // ✅ ADD HERE
  useEffect(() => {
    // reset properly before animating
    if (open) {
      optionAnim.setValue(0);
      rotateAnim.setValue(0);
    }

    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: open ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(optionAnim, {
        toValue: open ? 1 : 0,
        duration: 320,
        useNativeDriver: true,
      }),
    ]).start();
  }, [open]);

  useEffect(() => {
    rotateAnim.setValue(0);
    optionAnim.setValue(0);
  }, []);

  const activeColor = useMemo(() => themeColors.primary, [isDark]);

  const inactiveColor = useMemo(() => '#fff', [isDark]);

  useEffect(() => {
    tabBarScrollY.setValue(0);
  }, []);

  const translateY = tabBarScrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 120],
    extrapolate: 'clamp',
  });

  const hapticOptions = useMemo(
    () => ({
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: true,
    }),
    [],
  );

  const isThreeButtonNav = Platform.OS === 'android' && bottomInset > 20;
  const androidHeight = tabCount === 3 ? (isThreeButtonNav ? 26 : 45) : 60;
  const tabHeight =
    Platform.OS === 'android'
      ? androidHeight + Math.max(bottomInset, 0)
      : 60;

  const fabSize = Math.max(54, Math.min(68, tabHeight));
  const FAB_OVERLAP = fabSize * 0.55;


  useEffect(() => {
    if (!layoutReady) return;

    const layout = tabLayouts.current[state.index];
    if (!layout) return;

    Animated.parallel([
      Animated.spring(translateX, {
        toValue: layout.x,
        friction: 8,
        tension: 80,
        useNativeDriver: false,
      }),
      Animated.spring(bubbleWidth, {
        toValue: layout.width - 12,
        friction: 8,
        tension: 80,
        useNativeDriver: false,
      }),
    ]).start();
  }, [state.index, layoutReady, bubbleWidth, translateX]);

  const handleTabPress = useCallback(
    (routeName: string) => {
      ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
      navigation.navigate(routeName);
    },
    [navigation, hapticOptions],
  );

  const getIconAndLabel = useCallback(
    (routeName: string, focused: boolean) => {
      const color = focused ? activeColor : inactiveColor;

      switch (routeName) {
        case 'Home':
          return {
            icon: (props: any) => <Home
              {...props}
              color={focused ? activeColor : inactiveColor}
              filled={focused}
            />,
            label: 'Home',
          };
        case 'Feed':
          return {
            icon: (props: any) => <Feed
              {...props}
              color={focused ? activeColor : inactiveColor}
              filled={focused}
            />,
            label: 'Feed',
          };

        case 'Chat':
          return {
            icon: (props: any) => <Chat
              {...props}
              color={focused ? activeColor : inactiveColor}
              filled={focused}
            />
            ,
            label: 'Chat',
          };

        case 'Connections':
          return {
            icon: (props: any) => <Users
              {...props}
              color={focused ? activeColor : inactiveColor}
              filled={focused}
            />,
            label: 'Connections',
          };

        case 'Opportunity':
          return {
            icon: (props: any) => <Oppurtunity {...props} color={color} />,
            label: 'Opportunity',
          };

        default:
          return {
            icon: (props: any) => (
              <Users {...props} color={focused ? activeColor : inactiveColor} />
            ),
            label: routeName,
          };
      }
    },
    [activeColor, inactiveColor],
  );

  const toggleMenu = (e: any) => {
    e.stopPropagation();
    setOpen(prev => !prev);
  };

  const closeMenu = () => {
    setOpen(false);
  };

  useEffect(() => {
    const listener = tabBarScrollY.addListener(({ value }) => {
      if (value > 10 && open) {
        closeMenu();
      }
    });

    return () => {
      tabBarScrollY.removeListener(listener);
    };
  }, [open]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <>
      {open && (
        <TouchableOpacity
          activeOpacity={1}
          style={styles.backdrop}
          onPress={closeMenu}

        />
      )}

      <Animated.View
        style={[
          styles.wrapper,
          {
            transform: [{ translateY }],
            bottom: Platform.OS === 'android' ? bottomInset + 14 : 18,
            height:
              Platform.OS === 'android'
                ? androidHeight + Math.max(bottomInset, 0)
                : 60,
          },
        ]}
      >
        {/* TAB CONTAINER */}

        <View style={styles.tabContainer}>
          {Platform.OS === 'ios' ? (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: '#000',
                },
              ]}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: 'rgba(28, 28, 30, 1)',
                },
              ]}
            />
          )}

          {state.routes.map((route: any, index: number) => {
            const focused = state.index === index;
            const { icon, label } = getIconAndLabel(route.name, focused);
            const Icon = icon;

            return (
              <TouchableOpacity
                key={route.key}
                onPress={() => handleTabPress(route.name)}
                style={styles.tabButton}
                onLayout={e => {
                  const { x, width } = e.nativeEvent.layout;
                  tabLayouts.current[index] = { x, width };

                  if (
                    !layoutReady &&
                    tabLayouts.current.filter(Boolean).length ===
                    state.routes.length
                  ) {
                    setLayoutReady(true);
                  }
                }}
              >
                <View style={styles.iconContainer}>
                  <Icon
                    width={21}
                    height={21}
                  />

                  <Text
                    style={[
                      styles.label,
                      { color: focused ? activeColor : inactiveColor },
                    ]}
                  >
                    {label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {fabOptions.map((item, index) => {
          const delay = index * 0.15;
          const Icon = item.icon;
          const iconColor = item.color;
          const route: any = item.route;

          const translateY = optionAnim.interpolate({
            inputRange: [delay, 1],
            outputRange: [0, -(index + 1) * 60],
            extrapolate: 'clamp',
          });

          const opacity = optionAnim.interpolate({
            inputRange: [delay, delay + 0.2],
            outputRange: [0, 1],
            extrapolate: 'clamp',
          });

          const scale = optionAnim.interpolate({
            inputRange: [delay, 1],
            outputRange: [0.8, 1],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={item.label}
              style={[
                styles.optionButton,
                {
                  transform: [{ translateY }, { scale }],
                  opacity,
                  pointerEvents: open ? 'auto' : 'none', // 👈 important
                },
              ]}
            >
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => {
                  closeMenu();
                  if (route) navigation.navigate(route);
                }}
              >
                <Text style={styles.optionLabel}>{item.label}</Text>

                <View style={styles.optionCircle}>
                  <Icon width={24} height={24} color={iconColor} />
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {/* Main FAB */}
        <View
          pointerEvents="box-none"
          style={StyleSheet.absoluteFill}
        >
          <TouchableOpacity style={[styles.addBtn, {
            width: fabSize,
            height: fabSize,
            borderRadius: fabSize / 2,
            right: 10,
            top: (tabHeight - fabSize) / 2,
          }]} onPress={toggleMenu}>
            <Animated.View style={{ transform: [{ rotate }] }}>
              <Ionicons name="add" size={34} color="#fff" />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
}

export default function BottomTabs() {
  const insets = useSafeAreaInsets();
  const isAndroid = Platform.OS === 'android';
  const isThreeButtonNav = isAndroid && insets.bottom > 0;

  const TAB_COUNT = 3;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: true,
        lazy: true,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: 'transparent',
          height: isThreeButtonNav ? 60 + insets.bottom : 70,
          paddingBottom: isThreeButtonNav ? insets.bottom : 10,
          paddingTop: 5,
          paddingHorizontal: Platform.OS === 'ios' ? 10 : 5,
        },
      }}
      tabBar={props => (
        <CustomTabBar
          {...props}
          bottomInset={isThreeButtonNav ? insets.bottom - 10 : 0}
          tabCount={TAB_COUNT}
        />
      )}
    >
      <Tab.Screen name="Home" component={StaticScreen} />
      <Tab.Screen name="Feed" component={HomeScreen} />
      <Tab.Screen name="Connections" component={Connections} />
      <Tab.Screen name="Chat" component={ChatListScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '95%',
    position: 'absolute',
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'visible',
    zIndex: 100000,
    elevation: 100000,
    paddingRight: 75,

  },
  tabContainer: {
    flex: 1,
    borderRadius: 100,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },

  tabButton: {
    flex: 1,
    alignItems: 'center',
  },

  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },

  label: {
    fontSize: responsiveFont(7),
    textAlign: 'center',
    fontFamily: Fonts.Bold,
  },

  animatedBubble: {
    position: 'absolute',
    left: 6,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    position: 'absolute',
    // right: Platform.OS === 'ios' ? -70 : -70,
    // top: Platform.OS === 'ios' ? 0 : -2,
    // width: 60,
    // height: 60,
    // borderRadius: 36,
    // backgroundColor: '#ff2d55',
    backgroundColor: themeColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100000,
    elevation: 100000,

  },

  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  optionButton: {
    position: 'absolute',
    right: 15,
    bottom: 0,
    marginBottom: 10,
    zIndex: 100000,
    elevation: 100000,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  optionLabel: {
    width: responsiveWidth(26),
    backgroundColor: 'rgba(0,0,0,0.75)',
    color: '#fff',
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Bold,
    textAlign: 'center',
  },

  optionCircle: {
    width: responsiveWidth(11),
    height: responsiveWidth(11),
    borderRadius: responsiveWidth(5.5),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});
