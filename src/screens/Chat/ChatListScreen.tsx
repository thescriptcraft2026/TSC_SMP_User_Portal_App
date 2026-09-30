import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  useColorScheme,
  StatusBar,
  Animated,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import HomeHeader from '../Home/components/Header/HomeHeader';
import NoConversation from '../../assets/SVG/NoConversation';
import Chat from '../../assets/SVG/Chat';
import { formatTime } from '../../utils/date';
import AppLoader from '../../components/Loader/AppLoader';
import { useDispatch, useSelector } from 'react-redux';
import {
  createChatThunk,
  getAllChatUsersThunk,
  getSuggestionChatUsersThunk,
  searchChatUsersThunk,
} from '../../redux/slices/chatSlice';
import { useFocusEffect } from '@react-navigation/native';
import { useSocket } from '../../context/SocketContext';
import Avatar from '../../components/Avatar/Avatar';
import defaultProfile from '../../assets/images/default-profile.jpg';
import { getSuggestedProfiles } from '../../redux/slices/connectionSlice';
import { connect } from '../../redux/slices/profileSlice';
import { useToast } from '../../components/Toast/ToastProvider';
import { getTimeAgo } from '../../utils/timeAgo';

const HEADER_HEIGHT = 60;

const ChatListScreen = ({ navigation }: any) => {
  const isDark = true;
  const [query, setQuery] = useState('');
  const headerOffset = React.useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch<any>();
  const { notificationCount: socketNotificationCount } = useSocket();
  const { show } = useToast();
  const [pendingUsers, setPendingUsers] = useState<number[]>([]);
  const [requestedUsers, setRequestedUsers] = useState<number[]>([]);

  // ✅ FIX: include socket
  const { socket, onlineUsers } = useSocket();

  const [refreshing, setRefreshing] = useState(false);

  const {
    chatUsers,
    loading,
    loadingMore,
    suggestionUsers,
    page,
    hasMore,
  } = useSelector((state: any) => state.chat);

  const { user } = useSelector((state: any) => state.auth);
  const notificationCountValue = useSelector(
    (state: any) => state.notification?.count || 0,
  );

  const totalNotificationCount =
    notificationCountValue + socketNotificationCount;

  /* ---------------- INITIAL LOAD ---------------- */
  useFocusEffect(
    useCallback(() => {
      dispatch(getAllChatUsersThunk({ page: 1, limit: 20 }));
      dispatch(getSuggestionChatUsersThunk());
      dispatch(getSuggestedProfiles(1));
    }, [dispatch]),
  );
  /* ---------------- FILTER ---------------- */
  const filteredChats = chatUsers.filter((c: any) =>
    c.name?.toLowerCase().includes(query.toLowerCase()),
  );

  const textColor = themeColors.white;

  /* ---------------- START CHAT ---------------- */
  const handleStartChat = async (item: any) => {
    // ✅ don't allow opening a chat with a deleted account
    // if (item?.isDeleted) return;
    console.log('CHAT USER', item);

    try {
      let chatId = item.id;

      if (!chatId) {
        const res = await dispatch(
          createChatThunk(Number(item?.user_id)),
        ).unwrap();

        chatId = res.chat_id;
      }

      navigation.navigate('ChatRoom', {
        chatId,
        user: {
          userId: item?.user_id,
          name: item?.name,
          avatar: item?.avatar,
          is_online: item?.online,
          isBlocked: item?.isBlocked,
          isDeleted: item?.isDeleted, // ✅ pass through so ChatRoom can also react
          user_name: item?.user_name,
        },
      });
    } catch (error) {
      console.log('Chat start error:', error);
    }
  };

  /* ---------------- ITEM ---------------- */
  const renderItem = ({
    item,
    showChatIcon = false,
    isConnection = false,
  }: any) => {
    const isOnline = onlineUsers.has(Number(item.user_id)) || item.online;

    // ✅ now populated by the thunk mapper; fallback kept for safety
    const isDeleted = item?.isDeleted ?? item?.users?.is_deleted ?? false;
    const isUnavailable = item?.isBlocked || isDeleted;

    const CURRENT_USER_ID = user?.id;
    const getLastMessageText = (chat: any) => {
      const isMe = chat?.sender_id === CURRENT_USER_ID;

      if (chat?.deletedAt) {
        return isMe ? 'You deleted this message' : 'This message was deleted';
      }

      if (chat?.file) {
        return isMe ? 'You sent an image' : '📷 Sent an image';
      }

      if (chat?.message) {
        const text = chat.message;
        return isMe ? `You: ${text}` : text;
      }

      return chat?.message || '';
    };
    
    console.log("chat item", item)

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        // disabled={isDeleted}
        style={[
          styles.chatCard,
          {
            backgroundColor: isConnection
              ? themeColors.card2
              : themeColors.card2,
            // opacity: isDeleted ? 0.6 : 1,
          },
        ]}
        onPress={() => handleStartChat(item)}
      >
        {/* Avatar */}
        <View>
          <Avatar
            uri={isUnavailable ? defaultProfile : item.avatar}
            name={isDeleted ? 'Deleted User' : item?.name}
            size={46}
          />
        </View>

        {/* Info */}
        <View style={styles.chatInfo}>
          <Text style={[styles.name, { color: textColor }]}>
            {isDeleted ? 'Deleted User' : item.name}
          </Text>

          {!isDeleted && (
            item?.message ? (
              <Text numberOfLines={1} style={styles.message}>
                {getLastMessageText(item.message)}
              </Text>
            ) : (
              <Text numberOfLines={1} style={styles.message}>
                @{item?.user_name}
              </Text>
            )
          )}
        </View>

        {/* Right */}
        {!isConnection && (
          <View style={styles.right}>
            <Text style={styles.time}>{getTimeAgo(item?.time)}</Text>

            {item.unread > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item?.unread}</Text>
              </View>
            )}
          </View>
        )}

        {/* CTA */}
        {showChatIcon && !isDeleted && (
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => handleStartChat(item)}
          >
            <Chat size={18} color={themeColors.white} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  /* ---------------- REFRESH ---------------- */
  const onRefresh = async () => {
    setRefreshing(true);

    await dispatch(getAllChatUsersThunk({ page: 1, limit: 20 }));
    await dispatch(getSuggestionChatUsersThunk());
    await dispatch(getSuggestedProfiles(1));

    setRefreshing(false);
  };

  const onSearchChange = (text: string) => {
    setQuery(text);

    if (text.trim().length > 0) {
      dispatch(searchChatUsersThunk(text));
    } else {
      dispatch(getAllChatUsersThunk({ page: 1, limit: 20 }));
    }
  };

  const loadMore = () => {
    if (loadingMore || loading || !hasMore) {
      return;
    }

    dispatch(
      getAllChatUsersThunk({
        page: page + 1,
        limit: 20,
      }),
    );
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
      <StatusBar
        translucent
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      <HomeHeader
        headerOffset={headerOffset}
        showTabs={false}
        notificationCount={totalNotificationCount}
        searchValue={query}
        onSearchChange={onSearchChange}
      />

      <SafeAreaView style={[styles.flex, { paddingTop: HEADER_HEIGHT + 12 }]}>
        {loading ? (
          <AppLoader visible />
        ) : (
          <>
            <FlatList
              data={filteredChats}
              keyExtractor={(item: any) => String(item.id)}
              renderItem={({ item }) => renderItem({ item })}
              refreshing={refreshing}
              onRefresh={onRefresh}
              showsVerticalScrollIndicator={false}
              onEndReached={loadMore}
              onEndReachedThreshold={0.3}
              contentContainerStyle={{
                paddingBottom: 120,
                flexGrow: 1,
              }}
              ListEmptyComponent={
                <>
                  <View style={styles.emptyContainer}>
                    <NoConversation size={100} color={textColor} />

                    <Text style={[styles.emptyTitle, { color: textColor }]}>
                      No Conversations Yet
                    </Text>

                    <Text style={styles.emptySubtitle}>
                      Connect with people and start meaningful conversations.
                    </Text>
                  </View>
                </>
              }
              ListFooterComponent={
                <>
                  {loadingMore && (
                    <ActivityIndicator
                      size="small"
                      color={themeColors.primary}
                      style={{ marginVertical: 20 }}
                    />
                  )}

                  {suggestionUsers.length > 0 && (
                    <>
                      <View style={styles.peopleHeader}>
                        <View style={styles.peopleLine} />

                        <Text style={styles.peopleHeaderText}>
                          CONNECTIONS
                        </Text>

                        <View style={styles.peopleLine} />
                      </View>

                      {suggestionUsers.map((item: any) => (
                        <View key={item.id}>
                          {renderItem({
                            item,
                            showChatIcon: true,
                            isConnection: true,
                          })}
                        </View>
                      ))}
                    </>
                  )}
                </>
              }
            />
          </>
        )}
      </SafeAreaView>
    </View>
  );
};

export default ChatListScreen;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1, paddingHorizontal: 12 },

  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 6,
  },

  avatar: { width: 46, height: 46, borderRadius: 23 },

  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },

  chatInfo: { flex: 1, marginLeft: 12 },

  name: { fontSize: 16, fontFamily: Fonts.Bold },

  message: { fontSize: 13, color: '#8e8e93', marginTop: 2 },

  right: { alignItems: 'flex-end' },

  time: { fontSize: 11, color: '#999' },

  badge: {
    backgroundColor: '#2b7fff',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 6,
  },

  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: Fonts.Bold,
  },

  primaryBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },

  divider: {
    height: 1,
    marginVertical: 16,
    backgroundColor: '#dddddd81',
  },

  container: {
    // padding: 14,
    // borderRadius: 18,
    // backgroundColor: themeColors.card2,
  },

  headingTxt: {
    fontFamily: Fonts.Bold,
    fontSize: 18,
    marginBottom: 8,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
    marginBottom: 25
  },

  emptyTitle: {
    fontSize: 18,
    fontFamily: Fonts.Bold,
    marginTop: 10,
  },

  emptySubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
  },

  userCard: {
    backgroundColor: themeColors.card2,
    padding: 10,
    borderRadius: 12,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "space-between"
  },
  userCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userCardLeftView: {
    marginLeft: 10,
    flexDirection: 'column',
  },
  userCardLeftViewText1: {
    fontSize: 16,
    fontFamily: Fonts.Medium,
    color: themeColors.white,
  },
  userCardLeftViewText2: {
    fontSize: 11,
    color: themeColors.gray,
    fontFamily: Fonts.Regular
  },
  userCardBtn: {
    borderColor: themeColors.appBg,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 4,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  userCardBtnText: {
    fontSize: 14,
    fontFamily: Fonts.Medium,
    color: themeColors.appBg,
  },


  peopleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },

  peopleLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#3A2A00',
  },

  peopleHeaderText: {
    color: themeColors.white,
    fontSize: 12,
    letterSpacing: 2,
    marginHorizontal: 12,
    fontFamily: Fonts.Medium,
  },
});