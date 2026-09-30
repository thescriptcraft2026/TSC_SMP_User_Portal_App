import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HomeHeader from '../Home/components/Header/HomeHeader';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import ProfileSuggestionCard from '../../components/Cards/ProfileSuggestionCard';
import ConnectionRequestCard from './components/ConnectionRequestCard';
import { SkeletonCard } from './components/SkeletonCard';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import NoRequest from '../../assets/SVG/NoRequest';
import { useDispatch, useSelector } from 'react-redux';
import {
  acceptConnection,
  getPendingConnections,
  getSuggestedProfiles,
  rejectConnection,
} from '../../redux/slices/connectionSlice';
import AppLoader from '../../components/Loader/AppLoader';
import ProfileSuggestionSkeleton from '../../components/Cards/ProfileSuggestionSkeleton';
import { connect } from '../../redux/slices/profileSlice';
import { useToast } from '../../components/Toast/ToastProvider';
import { useSocket } from '../../context/SocketContext';

const HEADER_HEIGHT = Platform.OS === 'ios' ? 55 : 60;

type RootStackParamList = {
  Profile: {
    userId: string;
    isOwnProfile: boolean;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

const Connections = () => {
  const isDark = true;
  const headerOffset = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<NavigationProp | any>();
  const { show } = useToast();
  const dispatch = useDispatch<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [removeConnectionModal, setRemoveConnectionModal] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const { notificationCount: socketNotificationCount } = useSocket();

  const {
    pendingRequests = [],
    loading = false,
    suggestedUsers = [],
    page = 1,
    hasMore = true,
    loadingSuggestions = false,
  } = useSelector((state: any) => state?.connection || {});
  const { user } = useSelector((state: any) => state.auth);

  const filteredSuggestedUsers = React.useMemo(() => {
    return (suggestedUsers || []).filter(
      (item: any) => Number(item.id) !== Number(user?.id),
    );
  }, [suggestedUsers, user?.id]);

  const notificationCountValue = useSelector(
    (state: any) => state.notification?.count || 0,
  );

  const totalNotificationCount =
    notificationCountValue + socketNotificationCount;

  useFocusEffect(
    useCallback(() => {
      dispatch(getPendingConnections());
      dispatch(getSuggestedProfiles(1));

      // optional cleanup
      return () => { };
    }, [dispatch]),
  );

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      dispatch(getSuggestedProfiles(page));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(getPendingConnections());
    setRefreshing(false);
  };

  const safeRequests = Array.isArray(pendingRequests) ? pendingRequests : [];

  const formattedData = safeRequests.map((item: any) => ({
    id: item?.id?.toString(),

    // ✅ Name
    name: item?.requester?.name || 'Unknown',

    // ✅ Username or role
    title:
      item?.requester?.roles?.[0]?.name || // first role
      item?.requester?.user_name ||
      'User',

    // ✅ Avatar (correct field)
    avatar:
      item?.requester?.profile_photo_path || 'https://via.placeholder.com/100',

    // optional (if needed later)
    username: item?.requester?.user_name,
    status: item?.status,
  }));

  // ✅ Skeleton data (same type shape)
  const skeletonData = Array.from({ length: 5 }).map((_, i) => ({
    id: `skeleton-${i}`,
    name: '',
    title: '',
    avatar: '',
    username: '',
    status: '',
  }));


  const handleConnect = async (user: any) => {
    try {
      // already pending
      if (user?.connectionStatus?.status === 'pending') {
        setRemoveConnectionModal(true);
        return;
      }

      const res = await dispatch(connect(user?.id)).unwrap();

      // optimistic local update
      user.connectionStatus = {
        status: 'pending',
      };

      show({
        type: 'success',
        title: res?.message || 'Connection request sent',
      });
    } catch (error: any) {
      show({
        title: error || 'Something went wrong',
        type: 'error',
      });
    }
  };

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: isDark
            ? themeColors.black
            : themeColors.appBackground,
        },
      ]}
    >
      <StatusBar translucent barStyle={'light-content'}/>

      {/* HEADER */}
      <HomeHeader
        headerOffset={headerOffset}
        showTabs={false}
        notificationCount={totalNotificationCount}
      />

      {/* CONTENT */}
      <SafeAreaView style={styles.flex} edges={['left', 'right', 'top']}>
        <FlatList
          data={loading && !refreshing ? skeletonData : formattedData}
          keyExtractor={item => item.id}
          // ✅ ADD THESE
          refreshing={refreshing}
          onRefresh={onRefresh}
          renderItem={({ item }: any) => {
            return loading ? (
              <SkeletonCard />
            ) : (
              <ConnectionRequestCard
                item={item}
                onAccept={async () => {
                  await dispatch(acceptConnection(Number(item.id)));
                  dispatch(getPendingConnections());
                }}
                onReject={async () => {
                  await dispatch(rejectConnection(Number(item.id)));
                  dispatch(getPendingConnections());
                }}
                onPress={() => {
                  navigation.push('Profile', {
                    username: item?.username,
                  });
                }}
              />
            );
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={
            <View style={styles.footer}>
              {loadingSuggestions ? (
                <ProfileSuggestionSkeleton /> // ✅ show skeleton
              ) : (
                <ProfileSuggestionCard
                  data={filteredSuggestedUsers}
                  onFollow={(user: any) => handleConnect(user)}
                  layout="grid"
                  onPress={(user: any) => {
                    navigation.navigate('Profile', {
                      username: user?.user_name || user?.id,
                    });
                  }}
                />
              )}
            </View>
          }
          ListEmptyComponent={
            !loading ? (
              <View style={{ flex: 1, alignItems: 'center' }}>
                <View style={styles.emptyContainer}>
                  <NoRequest size={100} color={themeColors.primary} />
                  <Text
                    style={[styles.emptySubtitle, { color: themeColors.white }]}
                  >
                    No New Request Found!
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.connectBtn}
                  onPress={() => {
                    navigation.navigate('MyConnections', {
                      initialTab: 0,
                      user_name: user?.user_name, // ✅ ADD THIS
                    });
                  }}
                >
                  <Text style={styles.connectBtnTxt}>View my connections</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
        <AppLoader visible={refreshing} />
      </SafeAreaView>
    </View>
  );
};

export default Connections;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  flex: {
    flex: 1,
  },

  listContent: {
    paddingTop: HEADER_HEIGHT + 14,
    paddingHorizontal: 10,
  },

  footer: {
    marginTop: 24,
    // paddingTop: 10,
    paddingBottom: 120, // 🔥 FAB spacing
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.Bold,
    marginBottom: 14,
    paddingHorizontal: 12,
  },

  emptyContainer: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  emptyTitle: {
    fontSize: 18,
    fontFamily: Fonts.Bold,
    marginTop: 10,
  },
  emptyEmoji: {
    fontSize: 42,
  },

  emptySubtitle: {
    fontSize: 13,
    opacity: 0.9,
    textAlign: 'center',
    fontFamily: Fonts.Regular
  },

  connectBtn: {
    borderColor: themeColors.primary,
    borderWidth:1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
    marginTop: 10,
  },
  connectBtnTxt: {
    color: themeColors.white,
    fontFamily: Fonts.Medium,
    fontSize: 13,
  },
});
