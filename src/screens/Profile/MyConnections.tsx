import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import { themeColors } from '../../theme/colors';
import AuthHeader from '../../components/Header/AuthHeader';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import ProfileTabs from '../Profile/components/ProfileTabs';

import FollowersList from './components/Tabs/FollowersList';
import FollowingList from './components/Tabs/FollowingList';
import ConnectionList from './components/Tabs/ConnectionList';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import {
  getConnectionsThunk,
  getFollowersThunk,
  getFollowingsThunk,
  searchConnectionsThunk,
} from '../../redux/slices/connectionSlice';
import { follow, unFollow } from '../../redux/slices/profileSlice';
import NoFollowers from '../../assets/SVG/NoFollowers';
import { Fonts } from '../../constants/Fonts';
import ConnectionItemSkeleton from './components/ConnectionItemSkeleton';
import { createChatThunk } from '../../redux/slices/chatSlice';
import { useToast } from '../../components/Toast/ToastProvider';
import api from '../../../Instance/Instance';

const TABS = ['Connections', 'Followers', 'Following',];

const MyConnections = () => {
  const isDark = true;
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [activeIndex, setActiveIndex] = useState(route.params?.initialTab ?? 0);
  const userName = route.params?.user_name;
  const { show } = useToast();

  const dispatch = useDispatch<any>();

  const {
    connections,
    followers,
    followings,
    loading,
    loadingMore,
    page,
    hasMore,
    searchedConnections,
    message,
  } = useSelector((state: any) => state.connection);
  const { user: profileUser } = useSelector((state: any) => state.book);
  const { user: authUser } = useSelector((state: any) => state.auth);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const isOwnProfile = authUser?.user_name === userName;

  useFocusEffect(
    useCallback(() => {
      if (!userName) return;

      if (activeIndex === 1) {
        dispatch(
          getFollowersThunk({
            user_name: userName,
            page: 1,
          }),
        );
      } else if (activeIndex === 2) {
        dispatch(
          getFollowingsThunk({
            user_name: userName,
            page: 1,
          }),
        );
      } else {
        dispatch(
          getConnectionsThunk({
            user_name: userName,
            page: 1,
          }),
        );
      }
    }, [userName, activeIndex]),
  );

  useFocusEffect(
    useCallback(() => {
      if (route.params?.initialTab !== undefined) {
        setActiveIndex(route.params.initialTab);
      }
    }, [route.params?.initialTab]),
  );

  const formattedConnections = (connections || []).map((item: any) => ({
    id: item?.id?.toString(),
    chatId: item?.chat?.chat_id,
    name: item?.name,

    // ✅ keep title if you want
    title: item?.roles?.map((r: any) => r.name).join(', ') || 'User',

    avatar: item?.profile_photo_path || 'https://via.placeholder.com/100',

    user_name: item?.user_name, // ⚠️ keep same key as UI
    roles: item?.roles || [], // ✅ ADD THIS
    connection_id: item?.connection_id,
    is_online: item.is_online,
  }));

  const formattedFollowers = (followers || []).map((item: any) => ({
    id: item?.id?.toString(),
    name: item?.name,
    avatar: item?.profile_photo_path,
    user_name: item?.user_name,
    roles: item?.roles || [],
    followedByYou: Number(item?.isFollowing) === 1,
  }));

  const formattedFollowings = (followings || []).map((item: any) => ({
    id: item?.id?.toString(),
    name: item?.name,
    avatar: item?.profile_photo_path,
    user_name: item?.user_name,
    roles: item?.roles || [],
    followedByYou: true, // ✅ already following
  }));

  const handleProfileView = (item: any) => {
    navigation.push('Profile', {
      username: item.user_name,
    });
  };

  const updateRelation = async (id: number, type: 'follow' | 'unfollow') => {
    try {
      if (type === 'follow') {
        await dispatch(follow(id)).unwrap();
      } else {
        await dispatch(unFollow(id)).unwrap();
      }

      if (activeIndex === 0) {
        dispatch(
          getFollowersThunk({
            user_name: userName,
            page: 1,
          }),
        );
      } else if (activeIndex === 1) {
        dispatch(
          getFollowingsThunk({
            user_name: userName,
            page: 1,
          }),
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  const loadMore = () => {
    if (loading || loadingMore || !hasMore || !userName) {
      return;
    }

    const nextPage = page + 1;

    switch (activeIndex) {
      case 0:
        dispatch(
          getFollowersThunk({
            user_name: userName,
            page: nextPage,
          }),
        );
        break;

      case 1:
        dispatch(
          getFollowingsThunk({
            user_name: userName,
            page: nextPage,
          }),
        );
        break;

      case 2:
        dispatch(
          getConnectionsThunk({
            user_name: userName,
            page: nextPage,
          }),
        );
        break;
    }
  };

  const EmptyState = () => {
    let title = '';
    let subtitle = '';
    let Icon = NoFollowers;

    if (activeIndex === 0) {
      title = 'No Followers Yet';
      subtitle = 'People who follow you will appear here.';
      Icon = NoFollowers;
    } else if (activeIndex === 1) {
      title = 'Not Following Anyone';
      subtitle = 'Start following people to see them here.';
      Icon = NoFollowers; // change if you have another icon
    } else {
      title = message || 'No Connections Yet';

      subtitle =
        message === 'Connections are private'
          ? 'This user has chosen to keep their connections private.'
          : 'Connect with people to build your network.';
    }

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={styles.emptyContainer}>
          <Icon size={100} color={themeColors.primary} />

          <Text
            style={[styles.emptyTitle, { color: isDark ? '#fff' : '#111' }]}
          >
            {title}
          </Text>

          <Text
            style={[styles.emptySubtitle, { color: isDark ? '#aaa' : '#666' }]}
          >
            {subtitle}
          </Text>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    // 🔥 SHOW LOADER FIRST
    if (loading) {
      return <ConnectionItemSkeleton />;
    }

    switch (activeIndex) {
      case 0:
        if (!formattedConnections.length) return <EmptyState />;
        return (
          <ConnectionList
            users={
              search.length
                ? searchedConnections.map((item: any) => ({
                  id: item.id.toString(),
                  chatId: item.chat?.chat_id,
                  name: item.name,
                  title: item.roles?.map((r: any) => r.name).join(', ') || 'User',
                  avatar: item.profile_photo_path,
                  user_name: item.user_name,
                  roles: item.roles || [],
                  connection_id: item.connection_id,
                  is_online: item.is_online,
                }))
                : formattedConnections
            }
            updateRelation={updateRelation}
            onProfileView={handleProfileView}
            startChat={handleStartChat}
            onEndReached={loadMore}
            loadingMore={loadingMore}
          />
        );
      case 1:
        if (!formattedFollowers.length) return <EmptyState />;
        return (
          <FollowersList
            users={formattedFollowers}
            updateRelation={updateRelation}
            onProfileView={handleProfileView}
            currentUserName={
              profileUser?.user_name || profileUser?.id || profileUser?.user_id
            }
            onEndReached={loadMore}
            loadingMore={loadingMore}
          />
        );

      case 2:
        if (!formattedFollowings.length) return <EmptyState />;
        return (
          <FollowingList
            users={formattedFollowings}
            updateRelation={updateRelation}
            onProfileView={handleProfileView}
            currentUserName={
              profileUser?.user_name || profileUser?.id || profileUser?.user_id
            }
            onEndReached={loadMore}
            loadingMore={loadingMore}
          />
        );



      default:
        return null;
    }
  };

  const handleStartChat = async (item: any) => {
    try {
      let chatId = item.chatId;

      console.log('item chat id', chatId);

      // 🔥 If chat does NOT exist → create
      if (!chatId) {
        console.log('Creating chat...');

        const res = await dispatch(createChatThunk(Number(item.id))).unwrap();
        console.log('chat res', res);

        chatId = res.chat_id;
      }

      // ✅ Navigate to chat
      navigation.navigate('ChatRoom', {
        user: {
          id: item.id,
          name: item.name,
          avatar: item.avatar,
          is_online: item.is_online,
        },
        chatId,
      });
    } catch (error) {
      console.log('Chat start error:', error);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? themeColors.black
            : themeColors.appBackground,
        },
      ]}
    >

      <AuthHeader
        title={isOwnProfile ? 'My Connections' : `${userName}'s Connections`}
        showBack
        onBack={() => navigation.goBack()}
        showSearchIcon
        showSearchOpen={showSearch}
        onSearchToggle={() => setShowSearch(!showSearch)}
        search={search}
        setSearch={text => {
          setSearch(text);
          dispatch(
            searchConnectionsThunk({
              user_name: userName,
              page: 1,
              search: text,
            }),
          );
        }}
      />

      <ProfileTabs
        tabs={TABS}
        activeIndex={activeIndex}
        onTabChange={setActiveIndex}
      />

      {renderContent()}
    </SafeAreaView>
  );
};

export default MyConnections;

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyContainer: {
    // marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    // paddingHorizontal: 20,
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
  },
});
