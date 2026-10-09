import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Alert,
  RefreshControl,
  StatusBar,
  Text,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import AuthHeader from '../../components/Header/AuthHeader';
import { themeColors } from '../../theme/colors';
import ProfileTabs from './components/ProfileTabs';
import ProfileHeader from './components/ProfileHeader';
import EditAboutModal from './components/modals/EditAboutModal';
import ChangeImageModal from './components/modals/ChangeImageModal';
import AppLoader from '../../components/Loader/AppLoader';
import {
  connect,
  follow,
  getMeTabsData,
  getMyOpportunityData,
  unFollow,
  updateCoverPhoto,
  updateProfilePicture,
} from '../../redux/slices/profileSlice';
import {
  getPrimaryRoles,
  getSecondaryRoles,
  getUserThunk,
  updateBio,
} from '../../redux/slices/authSlice';
import { AppDispatch } from '../../redux/store';
import { getUserProfile } from '../../redux/slices/bookSlice';
import { useToast } from '../../components/Toast/ToastProvider';
import RemoveConnectionModal from './components/modals/RemoveConnectionModal';
import api from '../../../Instance/Instance';
import MenuOption from './components/Menu';
import CollaborationModal from './components/modals/CollaborationModal';
import BookTab from './components/Tabs/BookTab';
import SynopsesTab from './components/Tabs/SynopsesTab';
import VisionXTab from './components/Tabs/VisionsxTab';
import OpportunityTab from './components/Tabs/OpportunityTab';
import PostTab from './components/Tabs/PostTab';
import {
  acceptConnection,
  rejectConnection,
} from '../../redux/slices/connectionSlice';
import ReportModal from '../../components/Modals/ReportModal';
import { createReport, getReports } from '../../redux/slices/reportSlice';
import { useShare } from '../../hooks/useShare';
import NotFoundScreen from '../NotFoundScreen';

const TAB_TYPE_MAP: any = {
  0: 'post',
  1: 'book',
  2: 'script',
  3: 'visionx',
  4: 'opportunity', // ✅ ADD THIS
};
const tabs = ['Posts', 'Books', 'Synopses', 'Creators Zone', 'Opportunities'];

const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isDark = true;
  const { show } = useToast();

  const dispatch = useDispatch<AppDispatch>();

  // ✅ Redux
  const { user: authUser } = useSelector((state: any) => state.auth);
  const { user: bookUser, loading } = useSelector((state: any) => state.book);
  const tabsState = useSelector((state: any) => state.profile?.tabs);
  const data = tabsState?.data || [];
  const page = tabsState?.page || 1;
  const tabsLoading = tabsState?.loading || false;
  const hasMore = tabsState?.hasMore ?? true;

  const opportunitiesState = useSelector(
    (state: any) => state.profile.opportunities,
  );
  const { primaryRoles = [], secondaryRoles = [] } = useSelector(
    (state: any) => state.auth,
  );

  const opportunityData = opportunitiesState?.data || [];
  const opportunityPage = opportunitiesState?.page || 1;
  const opportunityLoading = opportunitiesState?.loading;
  const opportunityHasMore = opportunitiesState?.hasMore;

  const username = route?.params?.isOwnProfile
    ? authUser?.user_name
    : route?.params?.username;

  // 🔥 ALWAYS USE PROFILE DATA (like web)
  const userData = bookUser;

  // console.log('user data', userData);

  // 🔥 REAL OWN PROFILE CHECK (ID MATCH)
  const isOwnProfile = bookUser?.id === authUser?.id;

  // ✅ Local states
  const [activeTab, setActiveTab] = useState(0);
  const [aboutModal, setAboutModal] = useState(false);
  const [savingBio, setSavingBio] = useState(false);
  const [imageModal, setImageModal] = useState(false);
  const [imageType, setImageType] = useState<'avatar' | 'banner' | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [removeConnectionModal, setRemoveConnectionModal] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 4, y: 0 });
  const [collaborationModal, setCollaboratiomModal] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [postsPage, setPostsPage] = useState(1);
  const [postsHasMore, setPostsHasMore] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);

  const handleBack = () => navigation.goBack();
  const postsLoadingRef = useRef(false);

  const backgroundColor = isDark
    ? themeColors.black
    : themeColors.appBackground;

  const formatDate = (date: any) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // ✅ ALWAYS FETCH PROFILE (for both me & others)
  useFocusEffect(
    useCallback(() => {
      if (!username) return;

      dispatch(getUserProfile(username))
        .unwrap()
        .catch(err => {
          console.log('Error fetching profile:', err);
        });
    }, [username]),
  );

  useEffect(() => {
    dispatch(getReports());
  }, []);

  // ✅ BIO UPDATE
  const handleBioUpdate = async (bio: string) => {
    try {
      setSavingBio(true);
      await dispatch(updateBio({ bio })).unwrap();

      // 🔥 sync both
      await dispatch(getUserProfile(username)).unwrap();
      await dispatch(getUserThunk()).unwrap();

      setAboutModal(false);
    } catch (error: any) {
      Alert.alert('Error', error);
    } finally {
      setSavingBio(false);
    }
  };

  // ✅ IMAGE UPLOAD
  const handleImageUpload = async (image: any) => {
    try {
      setImageLoading(true);

      // ✅ REMOVE IMAGE
      if (image === null) {
        if (imageType === 'avatar') {
          await dispatch(updateProfilePicture(null)).unwrap();
        } else {
          await dispatch(updateCoverPhoto(null)).unwrap();
        }
      } else {
        // ✅ UPLOAD IMAGE
        if (imageType === 'avatar') {
          await dispatch(updateProfilePicture(image)).unwrap();
        } else {
          await dispatch(updateCoverPhoto(image)).unwrap();
        }
      }

      await dispatch(getUserProfile(username)).unwrap();
      await dispatch(getUserThunk()).unwrap();

      setImageModal(false);
    } catch (error) {
      console.log('Image upload error', error);
    } finally {
      setImageLoading(false);
    }
  };

  // ✅ REFRESH
  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await dispatch(getUserProfile(username)).unwrap();
    } finally {
      setRefreshing(false);
    }
  }, [username]);

  // Connet
  const handleConnect = async () => {
    try {
      // ✅ FIXED CHECK
      if (userData?.connectionStatus?.status === 'pending') {
        setRemoveConnectionModal(true);
        return;
      }

      const res = await dispatch(connect(userData?.id)).unwrap();

      // 🔥 REFRESH PROFILE IMMEDIATELY
      await dispatch(getUserProfile(username)).unwrap();
      await dispatch(getUserThunk()).unwrap();

      show({
        type: 'success',
        title: res?.message,
      });
    } catch (error) {
      show({
        title: error,
        type: 'error',
      });
    }
  };

  const handleRemoveConnection = async (connectionId: number) => {
    try {
      const response = await api.put(`/connection/${connectionId}/withdraw`, {
        status: 'withdrawn',
      });

      if (response.status === 200) {
        setRemoveConnectionModal(false);
        setMenuVisible(false); // 👈 Close the menu

        await dispatch(getUserProfile(username)).unwrap();

        show({
          type: 'success',
          title: response?.data?.message,
        });
      }
    } catch (error: any) {
      show({
        type: 'error',
        title:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      });
    }
  };

  const handleFollow = async () => {
    try {
      const isFollowing = userData?.relationship?.isFollowing;

      let res;

      if (isFollowing) {
        // 🔴 UNFOLLOW
        res = await dispatch(unFollow(userData?.id)).unwrap();
      } else {
        // 🟢 FOLLOW
        res = await dispatch(follow(userData?.id)).unwrap();
      }

      // 🔥 REFRESH PROFILE (sync UI)
      await dispatch(getUserProfile(username)).unwrap();

      await dispatch(getUserThunk()).unwrap();

      show({
        type: 'success',
        title: res?.message,
      });
    } catch (error: any) {
      show({
        type: 'error',
        title: error
      });
    }
  };

  const handleMenu = (e: any) => {
    const { pageY } = e.nativeEvent;

    setMenuPosition({ x: 20, y: pageY });
    setMenuVisible(true);
  };

  const experiences = useMemo(() => {
    if (!userData?.roles?.length) return [];

    return userData.roles
      .filter((item: any) => {
        const ur = item?.UserRole;

        return (
          ur &&
          (ur.experience_years !== null ||
            ur.experience_months !== null ||
            (ur.description && ur.description.trim() !== ''))
        );
      })
      .map((item: any) => {
        const years = item.UserRole.experience_years || 0;
        const months = item.UserRole.experience_months || 0;

        let expText = '';

        if (years > 0) expText += `${years} yr${years > 1 ? 's' : ''} `;
        if (months > 0) expText += `${months} month${months > 1 ? 's' : ''}`;

        return {
          id: item.UserRole?.role_id,
          role: item.display_name || item.name,
          experience: expText.trim(),
          description: item.UserRole.description,
        };
      });
  }, [userData?.roles]);

  const handleAccept = async () => {
    console.log('on accept', userData?.id);
    await dispatch(acceptConnection(Number(userData?.connectionStatus?.id)));
    dispatch(getUserProfile(username));
  };

  const handleReject = async () => {
    await dispatch(rejectConnection(Number(userData?.connectionStatus?.id)));
    dispatch(getUserProfile(username));
  };

  const handleCollborationSubmit = async (formData: any) => {
    try {
      const { type, roles } = formData;

      // ✅ FIXED
      const payload = {
        is_open: type ? 1 : 0,
        type: type || null,
        roles: type ? roles || [] : [],
      };

      const res = await api.post('/profile/open-to-collaborate', payload);

      console.log('COLLABORATION RESPONSE:', res?.data);

      if (res?.data?.success) {
        // ✅ refresh profile
        await dispatch(getUserProfile(username)).unwrap();
        // ✅ close modal first
        setCollaboratiomModal(false);

        // ✅ success toast
        setTimeout(() => {
          show({
            type: 'success',
            title: res?.data?.message || 'Updated successfully',
          });
        }, 200);
      }
    } catch (err: any) {
      console.log('COLLABORATION ERROR:', err?.response?.data || err);

      setCollaboratiomModal(false);

      setTimeout(() => {
        show({
          type: 'error',
          title:
            err?.response?.data?.message ||
            err?.message ||
            'Something went wrong',
        });
      }, 200);
    }
  };

  const collaborationData = userData?.open_to_collaboration_request?.[0];

  const uniqueRoles = useMemo(() => {
    const seen = new Set();

    return (collaborationData?.roles || []).filter((r: any) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
  }, [collaborationData]);

  // ✅ NEW: memoize defaultValues so its reference stays stable
  // across unrelated re-renders (redux updates, other dispatches, etc.)
  const collaborationDefaultValues = useMemo(
    () => ({
      publish:
        collaborationData?.is_open === 1 || collaborationData?.is_open === true,
      type: collaborationData?.type || null,
      roles: (collaborationData?.roles || []).map((r: any) => Number(r.id)),
    }),
    [
      collaborationData?.is_open,
      collaborationData?.type,
      JSON.stringify(collaborationData?.roles),
    ],
  );

  const allRoles = useMemo(() => {
    const map = new Map();

    [...primaryRoles, ...secondaryRoles].forEach((role: any) => {
      if (!map.has(role.id)) {
        map.set(role.id, role);
      }
    });

    return [...map.values()];
  }, [primaryRoles, secondaryRoles]);

  useEffect(() => {
    if (!userData?.id) return;

    // 🔥 Opportunity tab
    if (activeTab === 4) {
      dispatch(
        getMyOpportunityData({
          page: 1,
          username: userData?.user_name,
        }),
      );
      return;
    }

    // 🔥 Other tabs
    const type = TAB_TYPE_MAP[activeTab as keyof typeof TAB_TYPE_MAP];

    if (!type) return;

    dispatch(
      getMeTabsData({
        page: 1,
        type,
        user_id: userData?.id,
      }),
    );
  }, [activeTab, userData?.id]);




  const loadMore = () => {
    if (activeTab === 4) {
      if (!opportunityLoading && opportunityHasMore) {
        dispatch(getMyOpportunityData({ page: opportunityPage + 1, username: userData?.user_name }));
      }
      return;
    }

    if (activeTab === 0) return; // Posts tab handled separately via loadMorePosts

    const type = TAB_TYPE_MAP[activeTab as keyof typeof TAB_TYPE_MAP];
    if (!tabsLoading && hasMore && type) {
      dispatch(getMeTabsData({ page: page + 1, type, user_id: userData?.id }));
    }
  };

  const handleStartChat = (item: any) => {
    navigation.navigate('ChatRoom', {
      chatId: item?.chat_id || null, // ✅ existing chat_id or null
      isNewChat: !item?.chat_id, // optional
      user: {
        id: item?.id,
        userId: item?.id,
        user_name: item?.user_name,
        name: item?.name,
        avatar: item?.profile_photo_path || item?.avatar,
        is_online: item?.is_online,
      },
    });
  };

  const handleBlock = async () => {
    try {
      const userId = userData?.id;
      const actionType = userData?.hasBlockedUser ? 'unblock' : 'block';

      const res = await api.post('/profile/block-user', {
        blocked_userid: userId,
        type: actionType,
      });

      // Refresh profile
      await dispatch(getUserProfile(username)).unwrap();

      // Optional if your auth user also changes
      await dispatch(getUserThunk()).unwrap();

      setMenuVisible(false);

      show({
        type: 'success',
        title: res?.data?.message,
      });
    } catch (error: any) {
      show({
        type: 'error',
        title: error?.response?.data?.message || 'Something went wrong',
      });
    }
  };

  const handleExpDelete = async (id: string) => {
    try {
      const res: any = await api.delete(`/profile/role-experience/${id}`);

      show({
        type: 'success',
        title: res?.data?.message,
      });

      // refresh profile
      dispatch(getUserProfile(username));
    } catch (error) {
      console.log('DELETE EXP ERROR:', error);

      show({
        type: 'error',
        title: 'Failed to delete experience',
      });
    }
  };

  const handleReportUser = async (data: any) => {
    try {
      const payload: any = {
        report_id: String(data?.reason),
        description: data?.message || '',
        reported_user_id: String(userData?.id),
        user_id: String(authUser?.id),
      };

      console.log('FINAL REPORT PAYLOAD:', payload);

      const res: any = await dispatch(createReport(payload)).unwrap();

      show({
        type: 'success',
        title: res?.message || 'Report submitted successfully',
      });

      setReportVisible(false);
      setMenuVisible(false);
    } catch (error: any) {
      console.log('REPORT ERROR:', error);

      show({
        type: 'error',
        title:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to submit report',
      });
    }
  };

  const getMinePostTabData = async (page = 1, append = false) => {
    if (postsLoadingRef.current) return; // hard guard, no stale-state race
    postsLoadingRef.current = true;
    try {
      if (append) setPostsLoading(true);

      const type = TAB_TYPE_MAP[activeTab] || 'post';
      const res = await api.get(
        `/content/user-posts?user_id=${username}&type=${type}&page=${page}&limit=10`,
      );

      const contents = res?.data?.data?.contents || [];
      const pagination = res?.data?.data?.pagination;

      setMyPosts(prev => {
        if (!append) return contents;
        const existingIds = new Set(prev.map((p: any) => p.id));
        const newOnes = contents.filter((p: any) => !existingIds.has(p.id)); // de-dupe safety net
        return [...prev, ...newOnes];
      });

      setPostsPage(page);
      setPostsHasMore(
        pagination ? page < pagination.total_pages : contents.length > 0,
      );
    } catch (error) {
      console.log(error, 'error');
    } finally {
      setPostsLoading(false);
      postsLoadingRef.current = false;
    }
  };

  const loadMorePosts = () => {
    if (!postsLoading && postsHasMore) {
      getMinePostTabData(postsPage + 1, true);
    }
  };

  useEffect(() => {
    if (activeTab === 0 && userData?.id) {
      setPostsPage(1);
      setPostsHasMore(true);
      getMinePostTabData(1, false);
    }
  }, [activeTab, userData?.id]);

  // ✅ LOADER
  const userNotFound =
    !loading &&
    (
      !username ||
      !bookUser ||
      Object.keys(bookUser).length === 0
    );
  const isLoading = savingBio || imageLoading || loading;

  const isBlocked =
    userData?.isBlockedByUser ||
    userData?.profileOwnerBlockedViewer?.status === 'blocked';

  useEffect(() => {
    dispatch(getPrimaryRoles());
    dispatch(getSecondaryRoles());
  }, []);

  const { handleShare } = useShare({
    type: 'profile',
    value: userData?.user_name || userData?.id || userData?.user_id,
    title: userData?.name,
  });

  if (userNotFound) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: themeColors.black,
        }}
        edges={['top', 'left', 'right']}
      >
        <StatusBar
          translucent={false}
          barStyle="light-content"
          backgroundColor="#000"
        />

        <AuthHeader
          showBack
          title="Profile"
          onBack={handleBack}
        />

        <NotFoundScreen
          title="User Not Found"
          description="The user you're looking for doesn't exist or may have been removed."
          icon="person-remove-outline"
          showButton
        />
      </SafeAreaView>
    );
  }

  console.log(
    'collaborationData',
    userData?.open_to_collaboration_request?.[0],
  );

  if (isLoading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: themeColors.black,
        }}
      >
        <StatusBar
          translucent
          barStyle="light-content"
        />

        <AppLoader visible />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        translucent={false}
        barStyle={'light-content'}
        backgroundColor={'#000'}
      />
      <AuthHeader
        showBack
        title={userData?.name || 'N/A'}
        onBack={handleBack}
        showMenu={!isOwnProfile}
        onMenuPress={handleMenu}
      />

      <FlatList
        data={[{ id: 'profile-content' }]}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.primary}
          />
        }
        ListHeaderComponent={
          <>
            <ProfileHeader
              key={userData?.id}
              name={userData?.name}
              currentUserId={authUser?.id}
              username={userData?.user_name}
              avatar={userData?.profile_photo_path}
              bannerImage={userData?.cover_photo_path}
              verified={userData?.verified}
              isBlocked={isBlocked}
              phone={userData?.phone}
              email={userData?.email}
              shortBio={userData?.short_bio}
              // ✅ ADD THESE
              gender={userData?.gender}
              dob={formatDate(userData?.dob)}
              city={userData?.city}
              state={userData?.state}
              country={userData?.country}
              location={[userData?.city, userData?.state]
                .filter(Boolean)
                .join(', ')}
              joined={`Joined ${formatDate(userData?.createdAt)}`}
              bio={userData?.bio}
              roles={userData?.roles}
              experiences={experiences}
              achievements={userData?.synopses}
              onLinePrefrence={userData?.user_works}
              posts={userData?.posts || 0}
              followers={userData?.stats?.followers}
              following={userData?.stats?.following}
              connections={userData?.stats?.connections}
              onEdit={
                isOwnProfile
                  ? () =>
                    navigation.navigate('EditProfile', {
                      username: userData?.user_name,
                    })
                  : undefined
              }
              onEditOnlinePrefrence={
                isOwnProfile
                  ? () => navigation.navigate('OnlinePrefrence')
                  : undefined
              }
              isOwnProfile={isOwnProfile}
              onMenuPress={handleMenu}
              onEditAbout={() => isOwnProfile && setAboutModal(true)}
              onEditAvatar={() => {
                if (isOwnProfile) {
                  setImageType('avatar');
                  setImageModal(true);
                }
              }}
              handleChat={() => handleStartChat(userData)}
              onEditBanner={() => {
                if (isOwnProfile) {
                  setImageType('banner');
                  setImageModal(true);
                }
              }}
              onEditRoles={() =>
                isOwnProfile ? navigation.navigate('RoleEdit') : undefined
              }
              onConnet={handleConnect}
              connectionStatus={userData?.connectionStatus}
              onFollow={handleFollow}
              relationship={userData?.relationship}
              onEditExperience={
                isOwnProfile
                  ? () => navigation.navigate('AddExperience')
                  : undefined
              }
              onAccept={handleAccept}
              onDecline={handleReject}
              onCollaboration={() =>
                isOwnProfile && setCollaboratiomModal(true)
              }
              collaborationRoles={uniqueRoles}
              collaborationType={collaborationData?.type}
              handleExpDelete={handleExpDelete}
            />

            {!isBlocked && (
              <ProfileTabs
                activeIndex={activeTab}
                onTabChange={setActiveTab}
                tabs={tabs}
              />
            )}
          </>
        }
        renderItem={() => {
          if (isBlocked) {
            return (
              <View
                style={{
                  marginTop: 32,
                  marginHorizontal: 16,
                  backgroundColor: '#141414',
                  borderRadius: 24,
                  paddingVertical: 36,
                  paddingHorizontal: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: 'white' }}>Profile Unavailable</Text>
              </View>
            );
          }

          return (
            <View>
              {activeTab === 0 && (
                <PostTab
                  data={myPosts}
                  loadMore={loadMorePosts}
                  refreshPosts={() => getMinePostTabData(1, false)}
                  isLoading={postsLoading}
                  hasMore={postsHasMore}
                />
              )}

              {activeTab === 1 && <BookTab data={data} loadMore={loadMore} isLoading={tabsLoading}
                hasMore={hasMore} />}

              {activeTab === 2 && (
                <SynopsesTab data={data} loadMore={loadMore} isLoading={tabsLoading}
                  hasMore={hasMore} />
              )}

              {activeTab === 3 && (
                <VisionXTab data={data} loadMoree={loadMore} isLoading={tabsLoading}
                  hasMore={hasMore} />
              )}

              {activeTab === 4 && (
                <OpportunityTab data={opportunityData} loadMore={loadMore} isLoading={opportunityLoading}
                  hasMore={opportunityHasMore} />
              )}
            </View>
          );
        }}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      />

      <EditAboutModal
        visible={aboutModal}
        onClose={() => setAboutModal(false)}
        onSave={handleBioUpdate}
        initialValue={userData?.bio}
        loading={savingBio}
      />

      <ChangeImageModal
        visible={imageModal}
        type={imageType}
        loading={imageLoading}
        onClose={() => setImageModal(false)}
        onSave={handleImageUpload}
        existingImage={
          imageType === 'avatar'
            ? userData?.profile_photo_path
            : userData?.cover_photo_path
        }
      />

      <RemoveConnectionModal
        visible={removeConnectionModal}
        onClose={() => setRemoveConnectionModal(false)}
        onSubmit={() => handleRemoveConnection(userData?.connectionStatus?.id)}
      />

      <MenuOption
        visible={menuVisible}
        x={menuPosition.x}
        y={menuPosition.y}
        status={userData?.connectionStatus?.status} // ✅ ADD THIS
        handleRemoveConnection={() =>
          handleRemoveConnection(userData?.connectionStatus?.id)
        }
        onClose={() => setMenuVisible(false)}
        onReport={() => {
          setMenuVisible(false);
        }}
        isBlocked={userData?.hasBlockedUser}
        handleBlock={handleBlock}
        handleReportUser={() => {
          setReportVisible(true);
        }}
        handleShare={handleShare}
      />

      <CollaborationModal
        visible={collaborationModal}
        onClose={() => setCollaboratiomModal(false)}
        roles={allRoles}
        onSubmit={handleCollborationSubmit}
        defaultValues={collaborationDefaultValues}
        isAdd={!collaborationDefaultValues?.type}
      />

      <ReportModal
        visible={reportVisible}
        onClose={() => setReportVisible(false)}
        onSubmit={handleReportUser}
        reportType="USER"
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
