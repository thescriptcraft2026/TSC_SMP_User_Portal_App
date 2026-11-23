import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import Chat from '../assets/SVG/Chat';
import UserPlus from '../assets/SVG/UserPlus';
import CheckTwo from '../assets/SVG/CheckTwo';
import { themeColors } from '../theme/colors';
import { follow, unFollow } from '../redux/slices/profileSlice';
import { useToast } from './Toast/ToastProvider';
import { responsiveWidth } from '../utils/responsive';

type Props = {
  creator: any;
  currentUserId?: string | number;
  onRefresh?: () => void;
  style?: any;
};

const CreatorInlineActions = ({ creator, currentUserId, onRefresh, style }: Props) => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const authUser = useSelector((state: any) => state.auth.user);
  const { show } = useToast();
  const [busy, setBusy] = useState<'message' | 'follow' | null>(null);
  const [isFollowing, setIsFollowing] = useState(
    creator?.isFollowing === 1 || creator?.isFollowing === true,
  );

  const creatorId = creator?.id || creator?.userId || creator?.user_id;
  const viewerId = currentUserId ?? authUser?.id;
  const isOwnContent = useMemo(
    () => !!creatorId && !!viewerId && String(creatorId) === String(viewerId),
    [creatorId, viewerId],
  );

  useEffect(() => {
    setIsFollowing(creator?.isFollowing === 1 || creator?.isFollowing === true);
  }, [creator?.isFollowing]);

  if (!creatorId || isOwnContent) return null;

  const handleMessage = () => {
    if (busy) return;
    setBusy('message');
    navigation.navigate('ChatRoom', {
      chatId: creator?.chat_id || null,
      isNewChat: !creator?.chat_id,
      user: {
        id: creatorId,
        userId: creatorId,
        user_name: creator?.user_name || creator?.username,
        name: creator?.name || creator?.display_name,
        avatar: creator?.profile_photo_path || creator?.profileImage || creator?.avatar,
        is_online: creator?.is_online,
      },
    });
    setBusy(null);
  };

  const handleFollow = async () => {
    if (busy) return;
    setBusy('follow');
    const nextFollowing = !isFollowing;
    try {
      await dispatch(
        nextFollowing ? follow(creatorId) : unFollow(creatorId),
      ).unwrap();
      setIsFollowing(nextFollowing);
      onRefresh?.();
    } catch (error: any) {
      show({
        type: 'error',
        title: error?.message || 'Unable to update follow status.',
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        accessibilityLabel="Message creator"
        accessibilityRole="button"
        disabled={!!busy}
        onPress={handleMessage}
        style={styles.button}
      >
        <Chat size={14} color={themeColors.white} />
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityLabel={isFollowing ? 'Following creator' : 'Follow creator'}
        accessibilityRole="button"
        disabled={!!busy}
        onPress={handleFollow}
        style={styles.button}
      >
        {isFollowing ? (
          <CheckTwo size={14} color={themeColors.primary} />
        ) : (
          <UserPlus size={14} color={themeColors.white} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 8 },
  button: {
    width: responsiveWidth(7),
    height: responsiveWidth(7),
    borderRadius: responsiveWidth(3.5),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
});

export default CreatorInlineActions;
