import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  useColorScheme,
  Keyboard,
  Animated,
  Pressable,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import { useDispatch, useSelector } from 'react-redux';
import NoComments from '../../assets/SVG/NoComments';
import { createComment } from '../../redux/slices/actionSlice';
import {
  addCommentLocal,
  fetchCommentsByPost,
  toggleCommentLikeLocal,
} from '../../redux/slices/feedSlice';
import FastImage from 'react-native-fast-image';
import Avatar from '../Avatar/Avatar';
import CommentSkeleton from '../skeleton/CommentSkeleton';
import api from '../../../Instance/Instance';

const CommentSheet = ({ visible, onClose, post }: any) => {
  const isDark = true;
  const dispatch = useDispatch<any>();

  const [text, setText] = useState('');

  const slideAnim = useRef(new Animated.Value(350)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const keyboardY = useRef(new Animated.Value(0)).current;

  const scaleAnimations = useRef<{ [key: string]: Animated.Value }>({}).current;
  const listRef = useRef<FlatList>(null);

  const {
    commentsByPost,
    commentsPageByPost,
    commentsHasMore,
    commentsLoadingMore,
  } = useSelector((state: any) => state.feed);
  const { user } = useSelector((state: any) => state.auth);

  // ✅ SAFE COMMENTS
  const commentsRaw = commentsByPost?.[post?.id] || [];
  const comments = Array.isArray(commentsRaw) ? commentsRaw : [];
  const isLoadingComments = !commentsRaw || commentsRaw.length === 0;

  /* ---------------- SAFE SCALE HANDLER ---------------- */

  const getScale = (id: string) => {
    if (!scaleAnimations[id]) {
      scaleAnimations[id] = new Animated.Value(1);
    }
    return scaleAnimations[id];
  };

  /* ---------------- ANIMATION ---------------- */

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(350);
      fadeAnim.setValue(0);

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 18,
          stiffness: 180,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 350,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  /* ---------------- KEYBOARD ---------------- */

  useEffect(() => {
    const show = Keyboard.addListener('keyboardWillShow', e => {
      Animated.timing(keyboardY, {
        toValue: -e.endCoordinates.height + 20,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });

    const hide = Keyboard.addListener('keyboardWillHide', () => {
      Animated.timing(keyboardY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  /* ---------------- HEART ANIMATION ---------------- */

  const animateHeart = (id: string) => {
    const scale = getScale(id);

    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.4,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /* ---------------- MAP COMMENTS ---------------- */

  const mappedComments = comments.map((item: any) => ({
    ...item, // ✅ keep original data
    name: item?.user?.name,
    avatar: item?.user?.profile_photo_path,
  }));
  /* ---------------- POST COMMENT ---------------- */

  const handlePostComment = async () => {
    if (!text.trim()) return;

    const commentText = text.trim();

    // ✅ optimistic UI
    dispatch(
      addCommentLocal({
        postId: post?.id,
        comment: {
          id: Date.now().toString(),
          comment: commentText,
          user: {
            name: user?.name,
            profile_photo_path: user?.profile_photo_path,
          },
          likes_count: 0,
          isLiked: false,
        },
      }),
    );

    setText('');

    try {
      await dispatch(
        createComment({
          synopsis_id: post?.id,
          comment: commentText,
        }),
      );
    } catch (err) {
      console.log(err);
    }

    setTimeout(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, 100);
  };

  const handleCommentLike = async (item: any) => {
    const commentId = item?.id;

    if (!commentId) return;

    const wasLiked = !!item?.isLiked;

    // ✅ optimistic UI (instant)
    dispatch(
      toggleCommentLikeLocal({
        commentId,
      }),
    );

    animateHeart(commentId);

    try {
      await api.post(`actions/comment/like/${commentId}`, {
        type: wasLiked ? 'delete' : 'create',
      });
    } catch (error) {
      console.log('error', error);

      // ❌ rollback if API fails
      dispatch(
        toggleCommentLikeLocal({
          commentId,
        }),
      );
    }
  };
  /* ---------------- RENDER ITEM ---------------- */

  const renderComment = useCallback(
    ({ item }: any) => {
      return (
        <View style={styles.commentRow}>
          <Avatar uri={item?.avatar} name={item?.name} size={36} />

          <View style={styles.commentContent}>
            <Text
              style={[
                styles.username,
                { color: isDark ? themeColors.white : '#000' },
              ]}
            >
              {item?.name}
            </Text>

            <Text style={[styles.comment, { color: isDark ? '#ccc' : '#444' }]}>
              {item?.comment}
            </Text>
          </View>

          <View style={styles.likeColumn}>
            <TouchableOpacity onPress={() => handleCommentLike(item)}>
              <Animated.View
                style={{
                  transform: [{ scale: getScale(item?.id) }],
                }}
              >
                <Ionicons
                  name={!!item?.isLiked ? 'heart' : 'heart-outline'}
                  size={18}
                  color={item?.isLiked ? '#ff3040' : '#888'}
                />
              </Animated.View>
            </TouchableOpacity>

            <Text style={styles.likeCount}>{item?.likes_count}</Text>
          </View>
        </View>
      );
    },
    [isDark],
  );

  useEffect(() => {
    if (visible && post?.id) {
      dispatch(fetchCommentsByPost({ postId: post.id, page: 1 }));
    }
  }, [visible, post?.id]);

  /* ---------------- UI ---------------- */

  return (
    <Modal visible={visible} transparent animationType="none">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </Pressable>

      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: isDark ? themeColors.card : themeColors.white,
            transform: [{ translateY: slideAnim }, { translateY: keyboardY }],
          },
        ]}
      >
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              { color: isDark ? themeColors.white : '#000' },
            ]}
          >
            Comments
          </Text>
        </View>

        <FlatList
          ref={listRef}
          data={isLoadingComments ? [] : mappedComments}
          keyExtractor={item => item.id}
          renderItem={renderComment}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (!post?.id) return;

            const currentPage = commentsPageByPost?.[post.id] || 1;
            const hasMore = commentsHasMore?.[post.id];
            const isLoadingMore = commentsLoadingMore?.[post.id];

            if (!hasMore || isLoadingMore) return;

            dispatch(
              fetchCommentsByPost({
                postId: post.id,
                page: currentPage + 1,
              }),
            );
          }}
          onEndReachedThreshold={0.3}
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent:
              isLoadingComments || mappedComments.length === 0
                ? 'center'
                : 'flex-start',
            paddingBottom: 20,
          }}
          ListEmptyComponent={() => {
            if (isLoadingComments) {
              return (
                <View style={{ marginTop: -100 }}>
                  <CommentSkeleton />
                </View>
              );
            }

            return (
              <View style={styles.emptyContainer}>
                <NoComments
                  size={100}
                  color={isDark ? themeColors.white : themeColors.black}
                />
                <Text
                  style={[
                    styles.emptyText,
                    { color: isDark ? '#aaa' : '#777' },
                  ]}
                >
                  No comments yet
                </Text>
              </View>
            );
          }}
          ListFooterComponent={() => {
            if (commentsLoadingMore?.[post?.id]) {
              return <CommentSkeleton />;
            }
            return null;
          }}
        />
        <View style={styles.inputRow}>
          <FastImage
            source={{ uri: user?.profile_photo_path }}
            style={styles.avatarTwo}
          />

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Join the conversation..."
              placeholderTextColor="#888"
              value={text}
              onChangeText={setText}
              style={[styles.input, { color: isDark ? '#fff' : '#000' }]}
              onSubmitEditing={handlePostComment}
              returnKeyType="send"
            />

            <TouchableOpacity onPress={handlePostComment}>
              <Ionicons name="send" size={20} color={themeColors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

export default CommentSheet;
const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  sheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    maxHeight: '65%',
    minHeight: '50%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 4,
    alignSelf: 'center',
    marginBottom: 8,
  },

  closeBtn: {
    position: 'absolute',
    top: -10,
    right: -10,
    borderWidth: 0.5,
    borderRadius: 100,
    borderColor: '#ddd',
    padding: 3,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  title: {
    fontSize: 16,
    fontFamily: Fonts.Bold,
  },

  commentRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  avatarTwo: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },

  commentContent: {
    flex: 1,
    marginLeft: 10,
  },

  username: {
    fontFamily: Fonts.Bold,
    // marginBottom: 2,
    fontSize: 16,
  },

  comment: {
    fontSize: 13,
    fontFamily: Fonts.Regular,
  },

  likeColumn: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  likeCount: {
    fontSize: 11,
    color: '#777',
    fontFamily: Fonts.Bold,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingBottom: 25,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 4,
    fontFamily: Fonts.Regular,
  },

  inputContainer: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: {
    fontSize: 14,
    fontFamily: Fonts.SemiBold,
  },
});
