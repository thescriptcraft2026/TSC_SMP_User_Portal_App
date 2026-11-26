import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch } from 'react-redux';
import Avatar from '../Avatar/Avatar';
import { Fonts } from '../../constants/Fonts';
import { themeColors } from '../../theme/colors';
import { connect, follow } from '../../redux/slices/profileSlice';

type Props = {
  visible: boolean;
  creator?: any;
  onClose: () => void;
  onUpdated?: () => Promise<void> | void;
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
};

const CreatorConnectionModal = ({ visible, creator, onClose, onUpdated, onError, onSuccess }: Props) => {
  const dispatch = useDispatch<any>();
  const [busy, setBusy] = useState<'follow' | 'connect' | null>(null);
  const [localFollowing, setLocalFollowing] = useState(false);
  const [localConnection, setLocalConnection] = useState(false);
  const entrance = React.useRef(new Animated.Value(0)).current;

  const isFollowing = localFollowing || creator?.isFollowing === 1 || creator?.isFollowing === true;
  const connectionStatus = creator?.connectionStatus?.status;
  const isConnected =
    localConnection ||
    creator?.isConnected === 1 ||
    creator?.isConnected === true ||
    connectionStatus === 'accepted' ||
    connectionStatus === 'pending' ||
    connectionStatus === 'requested';

  const displayName = creator?.name || creator?.user_name || 'Creator';
  const username = creator?.user_name || creator?.username;
  const profileImage = creator?.profileImage || creator?.profile_photo_path;
  const hasAction = !isFollowing || !isConnected;

  useEffect(() => {
    setLocalFollowing(false);
    setLocalConnection(false);
    setBusy(null);
  }, [creator?.id]);

  useEffect(() => {
    if (visible) {
      entrance.setValue(0);
      Animated.spring(entrance, {
        toValue: 1,
        damping: 16,
        stiffness: 180,
        mass: 0.8,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, entrance]);

  const handleFollow = async () => {
    if (!creator?.id || busy) return;
    try {
      setBusy('follow');
      await dispatch(follow(Number(creator.id))).unwrap();
      setLocalFollowing(true);
      onSuccess?.('You are now following this creator');
      await onUpdated?.();
    } catch (error: any) {
      onError?.(error?.message || 'Unable to follow this creator');
    } finally {
      setBusy(null);
    }
  };

  const handleConnect = async () => {
    if (!creator?.id || busy) return;
    try {
      setBusy('connect');
      await dispatch(connect(Number(creator.id))).unwrap();
      setLocalConnection(true);
      onSuccess?.('Connection request sent');
      await onUpdated?.();
    } catch (error: any) {
      onError?.(error?.message || 'Unable to send the connection request');
    } finally {
      setBusy(null);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          style={[
            styles.card,
            {
              opacity: entrance,
              transform: [
                { translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [-90, 0] }) },
                { scale: entrance.interpolate({ inputRange: [0, 1], outputRange: [0.78, 1] }) },
              ],
            },
          ]}
        >
          <Pressable style={styles.cardContent} onPress={event => event.stopPropagation()}>
          <TouchableOpacity style={styles.close} onPress={onClose} accessibilityLabel="Close">
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
          <Avatar uri={profileImage} size={64} name={displayName} />
          <Text style={styles.title}>Connect with {displayName}</Text>
          {!!username && <Text style={styles.username}>@{username.replace(/^@/, '')}</Text>}
          <Text style={styles.subtitle}>Stay updated with their latest work.</Text>

          {hasAction ? (
            <View style={styles.actions}>
              {!isFollowing && (
                <TouchableOpacity style={styles.primaryButton} onPress={handleFollow} disabled={!!busy}>
                  {busy === 'follow' ? <ActivityIndicator color="#111" /> : <Text style={styles.primaryText}>Follow</Text>}
                </TouchableOpacity>
              )}
              {!isConnected && (
                <TouchableOpacity style={styles.secondaryButton} onPress={handleConnect} disabled={!!busy}>
                  {busy === 'connect' ? <ActivityIndicator color={themeColors.primary} /> : <Text style={styles.secondaryText}>Connect</Text>}
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <Text style={styles.completed}>You’re already following and connected.</Text>
          )}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.72)', padding: 24 },
  card: { width: '100%', maxWidth: 380, borderRadius: 24, backgroundColor: themeColors.card2, borderWidth: 1, borderColor: 'rgba(245,166,35,0.35)' },
  cardContent: { alignItems: 'center', padding: 28 },
  close: { position: 'absolute', top: 12, right: 16, padding: 4 },
  closeText: { color: '#aaa', fontSize: 28, lineHeight: 28 },
  title: { color: themeColors.white, fontFamily: Fonts.Bold, fontSize: 20, marginTop: 14, textAlign: 'center' },
  username: { color: '#aaa', fontFamily: Fonts.Regular, fontSize: 14, marginTop: 4 },
  subtitle: { color: '#bbb', fontFamily: Fonts.Regular, fontSize: 14, marginTop: 12, textAlign: 'center' },
  actions: { width: '100%', gap: 10, marginTop: 22 },
  primaryButton: { minHeight: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: themeColors.primary },
  secondaryButton: { minHeight: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: themeColors.primary },
  primaryText: { color: '#111', fontFamily: Fonts.Bold, fontSize: 16 },
  secondaryText: { color: themeColors.primary, fontFamily: Fonts.Bold, fontSize: 16 },
  completed: { color: '#bbb', fontFamily: Fonts.Regular, fontSize: 14, marginTop: 22, textAlign: 'center' },
});

export default CreatorConnectionModal;
