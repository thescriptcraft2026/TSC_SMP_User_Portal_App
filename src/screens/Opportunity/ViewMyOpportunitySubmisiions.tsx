import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  StatusBar,
  useColorScheme,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
  Linking,
} from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';

import { getOpportunitySubmissions } from '../../redux/slices/opportunitySlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthHeader from '../../components/Header/AuthHeader';
import { themeColors } from '../../theme/colors';
import Avatar from '../../components/Avatar/Avatar';
import { getTimeAgo } from '../../utils/timeAgo';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import { TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

// 🔥 Enable animation (Android fix)
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const ViewMyOpportunitySubmisiions = () => {
  const dispatch = useDispatch<any>();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const isDark = true;

  const { opportunity_id } = route.params || {};

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleBack = () => navigation.goBack();

  const backgroundColor = useMemo(
    () => (isDark ? themeColors.black : themeColors.appBackground),
    [isDark],
  );

  const cardBg = isDark ? '#1c1c1e' : '#fff';
  const textPrimary = isDark ? '#f5f5f7' : themeColors.black;
  const textSecondary = isDark ? '#8e8e93' : '#666';
  const borderColor = isDark ? '#2c2c2e' : '#ddd';

  const {
    submissions,
    submissionsLoading,
    submissionsHasMore,
    submissionsPage,
  } = useSelector((state: any) => state.opportunity);

  useEffect(() => {
    if (opportunity_id) {
      dispatch(
        getOpportunitySubmissions({
          page: 1,
          opportunity_id,
        }),
      );
    }
  }, [opportunity_id]);

  const openFile = async (url: string) => {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      // show({
      //   type: 'error',
      //   message: 'Unable to open file',
      // });
    }
  };
  const loadMore = () => {
    if (!submissionsLoading && submissionsHasMore) {
      dispatch(
        getOpportunitySubmissions({
          page: submissionsPage + 1,
          opportunity_id,
        }),
      );
    }
  };

  const renderEmpty = () => {
    if (submissionsLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📭</Text>

        <Text style={styles.emptyTitle}>No submissions found</Text>

        <Text style={styles.emptySubtitle}>
          There are no submissions for this opportunity yet.
        </Text>
      </View>
    );
  };

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(prev => (prev === id ? null : id));
  };

  const renderItem = ({ item }: any) => {
    const isExpanded = expandedId === item?.id;

    return (
      <Pressable
        onPress={() => toggleExpand(item?.id)}
        style={[styles.card, { backgroundColor: cardBg }]}
      >
        {/* 🔹 Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Avatar
              uri={item?.user?.profile_photo_path}
              name={item?.user?.name}
            />
            <View>
              <Text style={[styles.name, { color: textPrimary }]}>
                {item?.user?.name}
              </Text>
              <Text style={[styles.username, { color: textSecondary }]}>
                @{item?.user?.user_name}
              </Text>
            </View>
          </View>

          <Text style={[styles.time, { color: textSecondary }]}>
            {getTimeAgo(item?.createdAt)}
          </Text>
        </View>

        {/* 🔹 Divider */}
        <View style={styles.dividerContainer}>
          <View style={[styles.line, { backgroundColor: borderColor }]} />
          <Text style={styles.detailsText}>DETAILS</Text>
          <View style={[styles.line, { backgroundColor: borderColor }]} />
        </View>

        {/* 🔹 Contact */}
        {item?.description && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: textSecondary }]}>
              Description
            </Text>
            <Text
              numberOfLines={isExpanded ? undefined : 1}
              style={[styles.value, { color: textPrimary }]}
            >
              {item?.description}
            </Text>
          </View>
        )}

        {item?.contact_details && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: textSecondary }]}>
              Contact Details
            </Text>
            <Text
              numberOfLines={isExpanded ? undefined : 1}
              style={[styles.value, { color: textPrimary }]}
            >
              {item?.contact_details}
            </Text>
          </View>
        )}

        {item?.application_media && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: textSecondary }]}>
              Files / Media
            </Text>
            <TouchableOpacity
              onPress={() => openFile(item.application_media)}
              activeOpacity={0.7}
              style={styles.fileButton}
            >
              <Ionicons
                name="document-attach-outline"
                size={20}
                color="#4DA3FF"
              />

              <Text numberOfLines={1} style={styles.fileText}>
                View Attachment
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 🔹 Questions */}
        {item?.answers?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.questionTitle}>
              Questions ({item?.answers?.length || 0})
            </Text>

            {item?.answers
              ?.slice(0, isExpanded ? item.answers.length : 1)
              .map((q: any, index: number) => (
                <View key={index} style={{ marginTop: 8 }}>
                  <Text style={[styles.question, { color: textPrimary }]}>
                    {q?.question?.question}
                  </Text>
                  <Text
                    numberOfLines={isExpanded ? undefined : 1}
                    style={[styles.answer, { color: textSecondary }]}
                  >
                    {q?.answer}
                  </Text>
                </View>
              ))}
          </View>
        )}

        {/* 🔹 Expand / Collapse */}
        {item?.answers?.length > 1 && (
          <Text style={styles.expandText}>
            {isExpanded ? 'See less ▲' : 'See more ▼'}
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        translucent
        barStyle={'light-content'}
      />

      <AuthHeader showBack title="All Submissions" onBack={handleBack} />

      <View style={styles.container}>
        <FlatList
          data={submissions}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={
            submissionsLoading ? <ActivityIndicator /> : null
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default ViewMyOpportunitySubmisiions;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
    paddingHorizontal: 10,
  },

  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  name: {
    fontSize: 14,
    fontWeight: '600',
  },

  username: {
    fontSize: 12,
  },

  time: {
    fontSize: 11,
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },

  line: {
    flex: 1,
    height: 1,
  },

  detailsText: {
    marginHorizontal: 8,
    fontSize: 11,
    color: '#888',
  },

  section: {
    marginTop: 6,
  },

  label: {
    fontSize: 12,
  },

  value: {
    fontSize: 13,
    marginTop: 2,
  },

  questionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ff8c00',
    marginTop: 6,
  },

  question: {
    fontSize: 13,
    marginTop: 4,
  },

  answer: {
    fontSize: 12,
    marginTop: 2,
  },

  expandText: {
    marginTop: 8,
    fontSize: 12,
    color: '#ff8c00',
    fontWeight: '600',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 120,
    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: themeColors.white,
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'center',
    lineHeight: 20,
  },

  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  fileText: {
    marginLeft: 8,
    color: '#4DA3FF',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
