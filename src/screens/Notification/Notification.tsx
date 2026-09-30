import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SectionList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import moment from 'moment';

import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import AuthHeader from '../../components/Header/AuthHeader';

import { useDispatch, useSelector } from 'react-redux';
import {
  deleteNotification,
  deleteNotificationLocal,
  fetchNotifications,
  markAllAsRead,
  markAsReadLocal,
  markNotificationAsRead,
  resetNotifications,
} from '../../redux/slices/notificationSlice';
import Avatar from '../../components/Avatar/Avatar';
import Ionicons from '@react-native-vector-icons/ionicons';
import NotificationMenu from './components/NotificationMenu';
import NotFoundScreen from '../NotFoundScreen';
import { getDisplayTime } from '../../utils/timeAgo';

type Notification = {
  user_name: any;
  id: any;
  userId: any;
  user: string;
  message: string;
  time: string;
  avatar: string;
  unread?: boolean;
};

const NotificationScreen = () => {
  const isDark = true;
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { notifications, loading, loadingMore, page, hasMore } = useSelector(
    (state: any) => state.notification,
  );

  const bg = isDark ? themeColors.black : themeColors.appBackground;

  // ✅ API CALL
  useFocusEffect(
    useCallback(() => {
      dispatch(resetNotifications());
      dispatch(fetchNotifications({ page: 1 }));
    }, [dispatch]),
  );

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      dispatch(fetchNotifications({ page: page + 1 }));
    }
  };

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);

      dispatch(resetNotifications());
      await dispatch(fetchNotifications({ page: 1 })).unwrap();
    } catch (error) {
      console.log('Refresh Error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  // ✅ FORMAT API DATA
  const formattedNotifications = notifications?.map((item: any) => ({
    id: item.id.toString(),
    type: item?.type,

    userId: item?.user_id,
    otherId: item?.other_id,

    user: item?.user?.name,
    user_name: item?.other_user?.user_name || item?.user?.user_name,

    message: item?.message,
    time: item?.createdAt,
    postId: item?.synopses_id,

    avatar: item?.other_user
      ? item?.other_user?.profile_photo_path
      : item?.user?.profile_photo_path,

    unread: item?.is_read === false,

    synopsisId: item?.synopses_id,
    opportunityId: item?.oppurtunity_id,

    opp: item?.opp,
    synopsis: item?.synopsis,
  }));

  // ✅ GROUP BY DATE
  const today: Notification[] = [];
  const earlier: Notification[] = [];

  formattedNotifications?.forEach((item: any) => {
    if (moment(item.time).isSame(moment(), 'day')) {
      today.push(item);
    } else {
      earlier.push(item);
    }
  });

  const groupedData =
    formattedNotifications?.length > 0
      ? [
        { title: 'Today', data: today },
        { title: 'Earlier', data: earlier },
      ]
      : [];

  const openMenu = (event: any, item: any) => {
    const { pageX, pageY } = event.nativeEvent;

    setMenuPosition({
      x: 20, // right offset
      y: pageY,
    });

    setSelectedItem(item);
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
    setSelectedItem(null);
  };

  const handleMarkAsRead = (id: any) => {
    // ✅ instant UI update
    dispatch(markAsReadLocal(id));

    // ✅ API sync
    dispatch(markNotificationAsRead(id));
  };

  const handleMarkAllAsRead = async () => {
    try {
      // ✅ instant UI update
      formattedNotifications.forEach((n: any) => {
        if (n.unread) {
          dispatch(markAsReadLocal(n.id));
        }
      });

      // ✅ API sync
      const res = await dispatch(markAllAsRead()).unwrap();

      console.log('MARK ALL READ RES:', res);
    } catch (error) {
      console.log('MARK ALL READ ERROR:', error);
    }
  };

  // ✅ RENDER ITEM
  const renderItem = ({ item }: { item: Notification }) => {
    // console.log('ityem', item);
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => handleNotificationPress(item)}
        style={[
          styles.card,
          {
            backgroundColor: isDark ? '#1c1c1e' : themeColors.white,
            borderColor: item?.unread ? themeColors.primary : 'transparent',
          },
        ]}
      >
        <View style={{ marginRight: 12 }}>
          <Avatar uri={item?.avatar} size={36} name={item?.user_name} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.message, { color: isDark ? '#fff' : '#000' }]} numberOfLines={2} ellipsizeMode="tail">
            {item?.message}
          </Text>

          <Text style={styles.time}>{getDisplayTime(item?.time)}</Text>
        </View>

        {/* {item.unread && <View style={styles.dot} />} */}
        <TouchableOpacity onPress={e => openMenu(e, item)}>
          <Ionicons
            name="ellipsis-horizontal"
            size={16}
            color={isDark ? '#fff' : '#000'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const handleWarnNavigation = (item: any) => {
    const contentType = item?.synopsis?.type;

    switch (contentType) {
      case 'post':
        navigation.navigate('SinglePostDetailes', {
          postId: item?.synopsisId,
        });
        break;

      case 'script':
        navigation.navigate('SynopsisDetails', {
          synopsisId: item?.synopsisId,
        });
        break;

      case 'book':
        navigation.navigate('BookDetails', {
          bookId: item?.synopsisId,
        });
        break;

      case 'visionx':
        navigation.navigate('VisionXDetails', {
          visionxId: item?.synopsisId,
        });
        break;

      case 'post':
        navigation.navigate('SinglePostDetailes', {
          postId: item?.synopsisId,
        });
        break;

      default:
        console.log('Unknown warning content type:', contentType);
        break;
    }
  };

  const handleNotificationPress = (item: any) => {
    if (item?.unread) {
      handleMarkAsRead(item?.id);
    }

    switch (item?.type) {
      case 'follow':
      case 'profile_view':
      case 'connection_request':
      case 'connection_accepted':
        navigation.navigate('Profile', {
          username: item?.user_name,
        });
        break;

      case 'post':
        navigation.navigate('SinglePostDetailes', {
          postId: item?.synopsisId,
        });
        break;

      case 'script':
        navigation.navigate('SynopsisDetails', {
          synopsisId: item?.synopsisId,
        });
        break;

      case 'book':
        navigation.navigate('BookDetails', {
          bookId: item?.synopsisId,
        });
        break;

      case 'visionx':
        navigation.navigate('VisionXDetails', {
          visionxId: item?.synopsisId,
        });
        break;

      case 'opportunity':
        navigation.navigate('SingleOpportunityDetails', {
          opp_id: item?.opportunityId,
        });
        break;

      case 'adminside_job':
        navigation.navigate('SingleOpportunityDetails', {
          opp_id: item?.opp?.opp_id,
        });
        break;

      case 'userside_job':
        navigation.navigate('SingleOpportunityDetails', {
          opp_id: item?.opp?.opp_id || item?.opportunityId,
        });
        break;


      case 'warn':
        handleWarnNavigation(item);
        break;

      case 'repost':
        navigation.navigate('RepostDetails', {
          postId: item?.synopsisId,
        });
        break;

      default:
        break;
    }
  };

  const unreadCount = formattedNotifications.filter(
    (item: any) => item.unread,
  ).length;

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: bg }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        barStyle={'light-content'}
        translucent
      />

      {/* HEADER */}
      <AuthHeader
        title="Notifications"
        showBack
        onBack={() => navigation.goBack()}
        showMarkAllRead={true}
        handleMarkAllRead={handleMarkAllAsRead}
        markAllReadDisabled={unreadCount === 0}
      />

      {/* LIST */}
      <SectionList
        sections={groupedData}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 10, paddingBottom: 30 }}
        keyboardDismissMode="on-drag"
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.primary}
            colors={[themeColors.primary]}
            progressBackgroundColor="#1c1c1e"
          />
        }
        renderSectionHeader={({ section: { title, data } }) =>
          data.length > 0 ? (
            <Text
              style={[
                styles.sectionHeader,
                { color: isDark ? '#aaa' : '#666' },
              ]}
            >
              {title}
            </Text>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <NotFoundScreen
              title="No Notifications Yet"
              description="When someone follows, connects, or interacts with you, notifications will appear here."
              icon="notifications-off-outline"
              showButton={false}
            />
          ) : null
        }
        ListFooterComponent={
          loadingMore && notifications?.length > 0 ? (
            <ActivityIndicator style={{ marginVertical: 20 }} color={themeColors.primary}/>
          ) : null
        }
      />

      <NotificationMenu
        visible={menuVisible}
        x={menuPosition.x}
        y={menuPosition.y}
        onClose={closeMenu}
        isRead={!selectedItem?.unread}
        onMarkAsRead={() => {
          if (selectedItem) {
            handleMarkAsRead(selectedItem?.id);
            closeMenu();
          }
        }}
        onDelete={() => {
          if (selectedItem) {
            dispatch(deleteNotificationLocal(selectedItem.id));
            dispatch(deleteNotification(selectedItem.id));
            closeMenu();
          }
        }}
      />
    </SafeAreaView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  sectionHeader: {
    fontSize: 13,
    fontFamily: Fonts.Medium,
    marginVertical: 5,
    marginLeft: 6,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,

    elevation: 2,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },

  message: {
    fontSize: 14,
    fontFamily: Fonts.Regular,
  },

  time: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    fontFamily: Fonts.Regular,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: themeColors.primary,
  },

  // emptyContainer: {
  //   alignItems: 'center',
  //   marginTop: 100,
  // },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    marginTop: 120,
  },

  emptyIconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 100,
    backgroundColor: `${String(themeColors.primary)}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 18,
    fontFamily: Fonts.Bold,
    color: themeColors.white,
    marginBottom: 8,
  },

  emptySubTitle: {
    fontSize: 13,
    fontFamily: Fonts.Regular,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});
