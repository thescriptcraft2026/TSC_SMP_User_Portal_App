import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StatusBar,
  Keyboard,
} from 'react-native';

import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import Attach from '../../assets/SVG/Attach';
import { useDispatch, useSelector } from 'react-redux';
import { useSocket } from '../../context/SocketContext';
import {
  addMessage,
  clearChat,
  deleteMessageThunk,
  editLocalMessage,
  editMessageThunk,
  getMessagesThunk,
} from '../../redux/slices/chatSlice';
import api from '../../../Instance/Instance';
import ChatHeader from './components/ChatHeader';
import { formatTime } from '../../utils/date';
import { launchImageLibrary } from 'react-native-image-picker';
import FastImage from 'react-native-fast-image';
import Image from '../../assets/SVG/Image';
import { ActivityIndicator } from 'react-native-paper';
import NoChat from '../../assets/SVG/NoChat';
import ReportModal from '../../components/Modals/ReportModal';
import { createReport, getReports } from '../../redux/slices/reportSlice';
import { useToast } from '../../components/Toast/ToastProvider';
import defaultProfile from '../../assets/images/default-profile.jpg';

const ChatRoomScreen = () => {
  const isDark = true;
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const flatListRef = useRef<FlatList>(null);
  const sendAnim = useRef(new Animated.Value(1)).current;

  const [text, setText] = useState('');
  const [inputHeight, setInputHeight] = useState(40);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<any | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState<any>(null);
  const [showActions, setShowActions] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [editingMsg, setEditingMsg] = useState<any>(null);
  const [reportVisible, setReportVisible] = useState(false);
  const [reportType, setReportType] = useState<'CHAT' | 'MESSAGE'>('CHAT');

  const dispatch = useDispatch<any>();
  const route = useRoute<any>();
  const { show } = useToast();

  const { chatId, user } = route.params;
  console.log('userrrrrr', user);

  const { messages } = useSelector((state: any) => state.chat);
  const {
    socket,
    typingUsers,
    emitStopTyping,
    emitTyping,
    onlineUsers,
    markMessageAsRead,
  } = useSocket();

  const { user: authUser } = useSelector((state: any) => state.auth);
  const { page, hasMore, loading } = useSelector((state: any) => state.chat);
  const myId = authUser?.id;

  const textColor = isDark ? '#fff' : '#000';

  const receiverId = user?.userId ?? user?.id;

  const [isUserOnline, setIsUserOnline] = useState(
    user?.is_online ?? false,
  );

  useEffect(() => {
    // Don't override the API value until socket has emitted something.
    if (onlineUsers.size === 0) return;

    setIsUserOnline(onlineUsers.has(receiverId));
  }, [onlineUsers, receiverId]);

  /* ---------------- LOAD MESSAGES ---------------- */

  useFocusEffect(
    React.useCallback(() => {
      if (!chatId) return;

      dispatch(clearChat());

      dispatch(getMessagesThunk({ chatId, page: 1 }));

      return () => {
        dispatch(clearChat());
      };
    }, [chatId]),
  );

  /* ---------------- SOCKET LISTENER ---------------- */
  useEffect(() => {
    if (!chatId || !messages.length || !myId) return;

    const unreadMessages = messages.filter(
      (msg: any) =>
        msg.chat_id === chatId && msg.sender_id !== myId && !msg.is_read,
    );

    if (unreadMessages.length > 0) {
      const messageIds = unreadMessages.map((m: any) => m.id);

      // ✅ optimistic update (instant UI)
      dispatch({
        type: 'chat/markMessagesSeen',
        payload: {
          chat_id: chatId,
          message_ids: messageIds,
        },
      });

      // ✅ socket emit
      markMessageAsRead({
        chat_id: chatId,
        message_ids: messageIds,
      });
    }
  }, [messages, chatId, myId]);

  /* ---------------- SEND MESSAGE ---------------- */

  const isChatDisabled = user?.isBlocked || user?.isDeleted;

  const handleTyping = useCallback(() => {
    if (!user?.userId || !chatId) return;

    if (!isTyping) {
      setIsTyping(true);
      emitTyping({
        sender_id: authUser?.id!,
        receiver_id: user?.userId,
        chat_id: chatId,
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        emitStopTyping({
          sender_id: authUser?.id!,
          receiver_id: user.userId,
          chat_id: chatId,
        });
      }
    }, 2000);
  }, [
    isTyping,
    user.userId?.id,
    chatId,
    authUser?.id,
    emitTyping,
    emitStopTyping,
  ]);

  const handleMessageChange = (text: string) => {
    setText(text);
    handleTyping();
  };

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
    });

    if (result.didCancel || !result.assets?.length) return;

    setSelectedFile(result.assets[0]); // ✅ store only
  };

  const sendMessage = async () => {
    if (isChatDisabled) return;
    if (!text.trim() && !selectedFile) return;

    // ✏️ EDIT MODE
    if (editingMsg) {
      dispatch(
        editLocalMessage({
          message_id: editingMsg.id,
          message: text,
        }),
      );

      dispatch(
        editMessageThunk({
          message_id: editingMsg.id,
          message: text,
        }),
      );

      setEditingMsg(null);
      setText('');
      return;
    }

    const tempId = Date.now().toString();

    // 🔥 optimistic UI
    dispatch(
      addMessage({
        id: tempId,
        message: text,
        image: selectedFile?.uri,
        sender_id: myId,
        chat_id: chatId,
        status: 'sending',
        type: selectedFile ? 'image' : 'text',
        createdAt: new Date().toISOString(),
      }),
    );

    const formData = new FormData();
    formData.append('receiver_id', String(user.userId || user.id));

    if (text.trim()) {
      formData.append('message', text);
    }

    if (selectedFile) {
      formData.append('file', {
        uri: selectedFile.uri,
        name: selectedFile.fileName || 'image.jpg',
        type: selectedFile.type || 'image/jpeg',
      });
    }

    setText('');
    setSelectedFile(null); // ✅ clear after send

    try {
      const res = await api.post('/chat', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      dispatch(
        addMessage({
          ...res.data.data,
          tempId,
          status: 'sent',
        }),
      );
    } catch (error) {
      console.log('Send failed', error);
    }
  };

  const isOtherTyping = useMemo(() => {
    return Array.from(typingUsers.values()).some(
      t => String(t.chat_id) === String(chatId) && t.sender_id !== myId,
    );
  }, [typingUsers, chatId, myId]);

  const headerSubtitle = useMemo(() => {
    if (isUserOnline) return 'online';
    return 'offline';
  }, [isUserOnline]);

  /* ---------------- Edit / Delete MESSAGE ---------------- */
  const handleDeletePress = () => {
    if (!selectedMsg) return;

    dispatch(deleteMessageThunk(selectedMsg.id));

    setShowActions(false);
  };

  const handleEditPress = () => {
    if (!selectedMsg) return;

    setEditingMsg(selectedMsg);
    setText(selectedMsg.text); // fill input
    setShowActions(false);
  };

  /* ---------------- FORMAT MESSAGES ---------------- */

  const formattedMessages = useMemo(() => {
    return messages
      .filter((msg: any) => {
        return msg.message || msg.file || msg.image;
      })
      .map((msg: any) => ({
        id: msg.id || msg.tempId,
        text: msg.isDeleted
          ? msg.sender_id === myId
            ? 'You deleted this message'
            : 'This message was deleted'
          : msg.message || '',
        image: msg.isDeleted ? null : msg.file || msg.image,
        mine: msg.sender_id === myId,
        time: msg.createdAt,
        status: msg.is_read ? 'seen' : msg.status || 'sent',
        type: msg.message_type || (msg.file ? 'image' : 'text'),
        is_deleted: msg.isDeleted,
        is_edited: msg.isEdited,
      }));
  }, [messages, myId]);

  useEffect(() => {
    if (!messages.length) return;

    // wait for UI render
    const timeout = setTimeout(() => {
      if (isAtBottom) {
        flatListRef.current?.scrollToOffset({
          offset: 0,
          animated: true,
        });
      }
    }, 50);

    return () => clearTimeout(timeout);
  }, [messages]);

  const onEndReachedCalledDuringMomentum = useRef(true);

  const handleLoadMore = () => {
    if (
      onEndReachedCalledDuringMomentum.current ||
      loading ||
      !hasMore ||
      messages.length === 0
    )
      return;

    dispatch(getMessagesThunk({ chatId, page: page + 1 }));
    onEndReachedCalledDuringMomentum.current = true;
  };

  const handleReport = async (data: any) => {
    try {
      if (!chatId) return; // ✅ correct check

      const payload: any = {
        report_id: data.reason,
        description: data.message || '',
        synopses_id: null,
        reported_user_id: null,
        chat_id: null,
        message_id: null,
      };

      // 🔥 MAIN LOGIC
      if (reportType === 'CHAT') {
        payload.chat_id = chatId;
        payload.message_id = null;
      }

      if (reportType === 'MESSAGE') {
        payload.chat_id = null;
        payload.message_id = selectedMsg?.id;
      }

      console.log('FINAL REPORT PAYLOAD:', payload);

      const res: any = await dispatch(createReport(payload));

      if (res?.meta?.requestStatus === 'fulfilled') {
        show({
          type: 'success',
          title: res?.payload?.message || 'Reported successfully',
        });
      } else {
        show({
          type: 'error',
          title: 'Report failed',
        });
      }

      setReportVisible(false);
    } catch (error: any) {
      show({
        type: 'error',
        title: 'Something went wrong',
      });
    }
  };

  const showInitialLoader = loading && messages.length === 0;

  /* ---------------- MESSAGE ITEM ---------------- */

  const ChatItem = React.memo(({ item, onImagePress }: any) => {
    const [imgError, setImgError] = useState(false);
    useEffect(() => {
      setImgError(false);
    }, [item?.image]);
    return (
      <View
        style={{
          alignSelf: item.mine ? 'flex-end' : 'flex-start',
          marginBottom: 12,
          maxWidth: '75%',
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={isChatDisabled}
          onLongPress={e => {
            if (isChatDisabled) return;

            const { pageX, pageY } = e.nativeEvent;

            setSelectedMsg(item);
            setMenuPosition({ x: pageX, y: pageY });
            setShowActions(true);
          }}
        >
          <View
            style={[
              styles.msgBubble,
              {
                backgroundColor: item.is_deleted
                  ? themeColors.card // WhatsApp deleted bubble
                  : selectedMsg?.id === item.id
                    ? '#d1f5d3'
                    : item.mine
                      ? themeColors.card2
                      : isDark
                        ? '#1e1e1e'
                        : '#fff',
                borderTopRightRadius: item?.mine ? 0 : 10,
                borderTopLeftRadius: item?.mine ? 10 : 0,
              },
            ]}
          >
            {/* 🔥 IMAGE */}
            {item.image && !item.is_deleted && (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onImagePress(item.image)}
                onLongPress={e => {
                  if (isChatDisabled) return;

                  const { pageX, pageY } = e.nativeEvent;

                  setSelectedMsg(item);
                  setMenuPosition({ x: pageX, y: pageY });
                  setShowActions(true);
                }}
                delayLongPress={250}
              >
                <FastImage
                  source={
                    imgError
                      ? require('../../assets/images/fallback.png')
                      : { uri: item.image }
                  }
                  style={{
                    width: 220,
                    aspectRatio: 1,
                    borderRadius: 12,
                  }}
                  resizeMode={FastImage.resizeMode.cover}
                  onError={() => setImgError(true)}
                />
              </TouchableOpacity>
            )}

            {/* 🔥 MESSAGE (caption) */}
            {item.is_deleted ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="ban-outline" size={14} color="#666" />
                <Text
                  style={{ fontStyle: 'italic', color: '#666', marginLeft: 4 }}
                >
                  {item.text}
                </Text>
              </View>
            ) : item.text ? (
              <>
                <Text
                  style={{
                    marginTop: item.image ? 6 : 0,
                    color: textColor,
                    fontSize: 14,
                    fontFamily: Fonts.Regular,
                  }}
                >
                  {item.text}
                </Text>

                {/* ✏️ EDITED LABEL */}
                {item.is_edited && (
                  <Text
                    style={{
                      fontSize: 10,
                      color: '#888',
                      marginTop: 2,
                      fontStyle: 'italic',
                    }}
                  >
                    edited
                  </Text>
                )}
              </>
            ) : null}
          </View>
        </TouchableOpacity>

        {/* 🔥 TIME + STATUS */}
        <View
          style={[
            styles.metaRow,
            {
              justifyContent: item.mine ? 'flex-end' : 'flex-start',
            },
          ]}
        >
          <Text style={styles.timeText}>{formatTime(item.time)}</Text>

          {/* ✅ ONLY FOR MY MESSAGES */}
          {item.mine && (
            <Ionicons
              name={
                item.status === 'sending'
                  ? 'time-outline'
                  : item.status === 'seen'
                    ? 'checkmark-done'
                    : 'checkmark'
              }
              size={14}
              color={
                item.status === 'seen'
                  ? '#4fc3f7' // blue tick
                  : '#999'
              }
              style={{ marginLeft: 4 }}
            />
          )}
        </View>
      </View>
    );
  });

  const renderItem = useCallback(({ item }: any) => {
    return (
      <ChatItem
        item={item}
        onImagePress={setPreviewImage}
        setSelectedMsg={setSelectedMsg}
        setShowActions={setShowActions}
      />
    );
  }, []);

  console.log('Received ChatId:', user);

  return (
    <SafeAreaView
      style={[
        styles.safe,
        {
          backgroundColor: isDark
            ? themeColors.black
            : themeColors.appBackground,
        },
      ]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 15 : 0}
      >
        <StatusBar
          translucent
          barStyle={'light-content'}
        />

        {/* HEADER */}
        <ChatHeader
          title={user?.name}
          name={user?.name}
          is_online={isChatDisabled ? false : isUserOnline}
          showBack
          onBack={() => navigation.goBack()}
          style={{
            borderBottomWidth: 0.5,
            borderBottomColor: themeColors.border,
          }}
          uri={isChatDisabled ? defaultProfile : user?.avatar}
          showMenu={!isChatDisabled}
          onReport={() => {
            if (isChatDisabled) return;

            dispatch(getReports());
            setReportType('CHAT');
            setReportVisible(true);
          }}
          handleProfile={() => {
            if (isChatDisabled) return;
            navigation.navigate('Profile', {
              username: user?.user_name || user?.userId || user?.id,
            });
          }}
        />

        {/* CHAT BODY */}
        <View style={{ flex: 1 }}>
          {/* CHAT LIST */}

          {showInitialLoader ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              extraData={messages}
              data={formattedMessages}
              renderItem={renderItem}
              keyExtractor={item => String(item?.id)}
              contentContainerStyle={{
                padding: 14,
                flexGrow: 1, // 🔥 important for empty state
              }}
              showsVerticalScrollIndicator={false}
              inverted
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.1}
              onMomentumScrollBegin={() => {
                onEndReachedCalledDuringMomentum.current = false;
              }}
              initialNumToRender={15}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews={true}
              onScroll={e => {
                const offset = e.nativeEvent.contentOffset.y;
                setIsAtBottom(offset < 80);
              }}
              scrollEventThrottle={16}
              maintainVisibleContentPosition={{
                minIndexForVisible: 0,
              }}
              ListFooterComponent={
                loading && page > 1 ? <ActivityIndicator size="small" /> : null
              }
              ListEmptyComponent={
                !loading ? (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <NoChat size={100} />
                    <Text
                      style={{
                        fontSize: 16,
                        marginTop: 10,
                        color: isDark ? '#aaa' : '#666',
                        fontFamily: Fonts.Bold,
                      }}
                    >
                      No conversation yet
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: Fonts.Regular,
                        color: isDark ? '#777' : '#999',
                      }}
                    >
                      Start the conversation!
                    </Text>
                  </View>
                ) : null
              }
            />
          )}
          {!isAtBottom && (
            <TouchableOpacity
              onPress={() =>
                flatListRef.current?.scrollToOffset({
                  offset: 0,
                  animated: true,
                })
              }
              style={{
                position: 'absolute',
                bottom: 50,
                right: 5,
                backgroundColor: themeColors.primary,
                width: 35,
                height: 35,
                borderRadius: 100,
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 5,
              }}
            >
              <Ionicons name="arrow-down" size={18} color={textColor} />
            </TouchableOpacity>
          )}
          {selectedFile && (
            <View
              style={{
                paddingHorizontal: 12,
                marginBottom: 6,
              }}
            >
              <View style={{ alignSelf: 'flex-start' }}>
                <FastImage
                  source={{ uri: selectedFile.uri }}
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 10,
                  }}
                />

                <TouchableOpacity
                  onPress={() => setSelectedFile(null)}
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    backgroundColor: '#000',
                    borderRadius: 12,
                  }}
                >
                  <Ionicons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          {/* ✅ TYPING INDICATOR */}
          {isOtherTyping && <TypingIndicator />}
          {/* ✅ BLOCKED MESSAGE */}
          <View
            style={[
              styles.inputBar
            ]}
          >
            <TouchableOpacity
              disabled={isChatDisabled}
              style={{
                marginRight: 8,
                opacity: isChatDisabled ? 0.5 : 1
              }}
              onPress={pickImage}
            >
              <Image
                size={22}
                color={isDark ? themeColors.white : themeColors.black}
              />
            </TouchableOpacity>

            <TextInput
              multiline
              editable={!isChatDisabled}
              value={text}
              placeholder={
                user?.isDeleted
                  ? 'You cannot message a deleted user'
                  : user?.isBlocked
                    ? 'You cannot message this user'
                    : 'Type a message...'
              }
              placeholderTextColor="#888"
              onChangeText={handleMessageChange}
              onContentSizeChange={e => {
                setInputHeight(
                  Math.min(120, Math.max(40, e.nativeEvent.contentSize.height)),
                );
              }}
              style={[
                styles.input,
                {
                  minHeight: 40,
                  maxHeight: 120,
                  textAlignVertical: 'top',
                  color: isDark ? '#fff' : '#000',
                  backgroundColor: isDark ? '#1e1e1e' : themeColors.white,
                  opacity: isChatDisabled ? 0.7 : 1,
                },
              ]}
            />

            <Animated.View
              style={{
                transform: [{ scale: sendAnim }],
                opacity: user?.isBlocked ? 0.5 : 1,
              }}
            >
              <TouchableOpacity
                disabled={isChatDisabled}
                style={[styles.sendBtn, {
                  opacity: isChatDisabled ? 0.5 : 1
                }]}
                onPress={sendMessage}
              >
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {previewImage && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#000',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999,
          }}
        >
          <TouchableOpacity
            style={{ position: 'absolute', top: 50, right: 20, zIndex: 10 }}
            onPress={() => setPreviewImage(null)}
          >
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>

          <FastImage
            source={{ uri: previewImage }}
            style={{
              width: '100%',
              height: '70%',
            }}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
      )}

      {showActions && !isChatDisabled && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowActions(false)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: menuPosition.y - 0,
              left: selectedMsg?.mine
                ? menuPosition.x - 150 // right side (your message)
                : menuPosition.x - 20, // left side (received message)
              backgroundColor: isDark ? '#2a2a2a' : '#fff',
              borderRadius: 12,
              paddingVertical: 6,
              width: 160,
              elevation: 8,
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowRadius: 10,
            }}
          >
            {selectedMsg?.mine && (
              <>
                {/* EDIT */}
                <TouchableOpacity
                  onPress={handleEditPress}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="create-outline" size={18} color={textColor} />
                  <Text style={{ marginLeft: 10, color: textColor }}>Edit</Text>
                </TouchableOpacity>

                {/* DELETE */}
                <TouchableOpacity
                  onPress={handleDeletePress}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="trash-outline" size={18} color="red" />
                  <Text style={{ marginLeft: 10, color: 'red' }}>Delete</Text>
                </TouchableOpacity>
              </>
            )}

            {/* REPORT */}
            {/* ONLY SHOW FOR RECEIVED MESSAGE */}
            {!selectedMsg?.mine && (
              <TouchableOpacity
                onPress={() => {
                  setShowActions(false);
                  setReportType('MESSAGE');
                  setReportVisible(true);
                }}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="flag-outline" size={18} color="orange" />
                <Text style={{ marginLeft: 10, color: 'orange' }}>Report</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      )}

      <ReportModal
        visible={reportVisible}
        onClose={() => setReportVisible(false)}
        post={reportType === 'MESSAGE' ? selectedMsg : null}
        reportType="MESSAGE"
        onSubmit={handleReport}
      />
    </SafeAreaView>
  );
};

export default ChatRoomScreen;

const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      );
    };

    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 200);
    const a3 = animate(dot3, 400);

    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, []);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 8,
      }}
    >
      {[dot1, dot2, dot3].map((anim, index) => (
        <Animated.View
          key={index}
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: '#9ca3af',
            marginRight: 5,
            opacity: anim,
            transform: [
              {
                scale: anim.interpolate({
                  inputRange: [0.3, 1],
                  outputRange: [0.8, 1.2],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  msgBubble: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginTop: 3,
  },

  timeText: {
    fontSize: 11,
    color: '#999',
    fontFamily: Fonts.Regular,
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderTopWidth: 0.5,
    borderTopColor: themeColors.border,
  },

  input: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },

  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: themeColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 22,
    fontFamily: Fonts.Bold,
    marginLeft: 10,
  },
});
