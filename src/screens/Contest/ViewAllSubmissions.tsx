import { FlatList, StatusBar, StyleSheet, View, Text } from 'react-native';
import React, {
  useMemo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { SafeAreaView } from 'react-native-safe-area-context';
import AuthHeader from '../../components/Header/AuthHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import { themeColors } from '../../theme/colors';
import SubmissionCard from './components/SubmissionCard';
import { useDispatch, useSelector } from 'react-redux';
import {
  getParticipantsByContestId,
  resetParticipants,
} from '../../redux/slices/contestSlice';

import { ActivityIndicator } from 'react-native-paper';
import AppLoader from '../../components/Loader/AppLoader';
import { Fonts } from '../../constants/Fonts';

const ViewAllSubmissions = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const route = useRoute<any>();
  const { contestId } = route.params || {};
  const isDark = true;
  const [refreshing, setRefreshing] = useState(false);
  const [bookmarkedItems, setBookmarkedItems] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [showSearch, setShowSearch] = useState(false);
  const [showGenre, setShowGenre] = useState(false);

  const isFetchingMore = useRef(false);

  /* ---------------- REDUX ---------------- */

  const {
    participants,
    participantsLoading,
    participantsPage,
    participantsHasMore,
  } = useSelector((state: any) => state.contest);

  /* ---------------- INITIAL FETCH ---------------- */

  useEffect(() => {
    if (!contestId) return;

    dispatch(resetParticipants());

    dispatch(
      getParticipantsByContestId({
        contest_id: contestId,
        page: 1,
      }),
    );
  }, [contestId]);

  /* ---------------- LOAD MORE ---------------- */

  const loadMore = async () => {
    if (
      participantsLoading ||
      !participantsHasMore ||
      !contestId ||
      isFetchingMore.current
    ) {
      return;
    }

    isFetchingMore.current = true;

    try {
      await dispatch(
        getParticipantsByContestId({
          contest_id: contestId,
          page: participantsPage + 1,
          search,
        }),
      );
    } finally {
      isFetchingMore.current = false;
    }
  };

  /* ---------------- REFRESH ---------------- */

  const onRefresh = async () => {
    if (!contestId) return;

    setRefreshing(true);

    dispatch(resetParticipants());

    await dispatch(
      getParticipantsByContestId({
        contest_id: contestId,
        page: 1,
        search,
      }),
    );

    setRefreshing(false);
  };

  /* ---------------- THEME ---------------- */

  const backgroundColor = useMemo(
    () => (isDark ? themeColors.black : themeColors.appBackground),
    [isDark],
  );

  /* ---------------- BOOKMARK ---------------- */

  const toggleBookmark = useCallback((id: string) => {
    setBookmarkedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
    );
  }, []);

  /* ---------------- DATA ---------------- */

  const submissions = useMemo(() => {
    return participants || [];
  }, [participants]);

  /* ---------------- RENDER ITEM ---------------- */

  const renderItem = useCallback(
    ({ item }: any) => {
      const isBookmarked = bookmarkedItems.includes(item?.id);

      return (
        <View style={styles.cardWrapper}>
          <SubmissionCard
            url={item?.image}
            title={item?.title}
            subtitle={item?.story}
            view={item?.views}
            type={item?.type}
            bookmarked={isBookmarked}
            onSaved={() => toggleBookmark(item?.id)}
            onPress={() => {
              navigation.navigate('ParticipateDetails', {
                id: item?.id,
              });
            }}
            user={item?.user?.name}
          />
        </View>
      );
    },
    [bookmarkedItems],
  );

  /* ---------------- KEY EXTRACTOR ---------------- */

  const keyExtractor = useCallback(
    (item: any, index: number) => `${item?.id}-${index}`,
    [],
  );

  /* ---------------- STATUS BAR ---------------- */

  useEffect(() => {
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
  }, [isDark]);

  /* ---------------- FULLSCREEN LOADER ---------------- */

  if (participantsLoading && submissions.length === 0) {
    return <AppLoader visible />;
  }

  /* ---------------- FOOTER ---------------- */

  const renderFooter = () => {
    if (!participantsLoading || !participantsHasMore) {
      return null;
    }

    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={themeColors.primary as any} />
      </View>
    );
  };

  /* ---------------- EMPTY ---------------- */

  const renderEmpty = () => {
    if (participantsLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Submissions Found</Text>

        <Text style={styles.emptySubtitle}>
          No participants have submitted entries yet.
        </Text>
      </View>
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

      <AuthHeader
        showBack
        title="All Submissions"
        fontSize={20}
        onBack={() => navigation.goBack()}
        showSearchIcon
        search={search}
        setSearch={setSearch}
        showSearchOpen={showSearch}
        onSearchToggle={() => {
          setShowSearch(prev => {
            const next = !prev;

            // close genre when opening search
            if (next) {
              setShowGenre(false);
            }

            if (!next) {
              setSearch('');

              dispatch(
                getParticipantsByContestId({
                  contest_id: contestId,
                  page: 1,
                  search: '',
                  sort_by: sortBy,
                }),
              );
            }

            return next;
          });
        }}
        onSearch={(text: string) => {
          setSearch(text);

          dispatch(
            getParticipantsByContestId({
              contest_id: contestId,
              page: 1,
              search: text,
              sort_by: sortBy,
            }),
          );
        }}
        dropdownType="submissionSort"
        showGenreIcon
        showGenreDropdown={showGenre}
        handleGenre={() => {
          setShowGenre(prev => {
            const next = !prev;

            // close search when opening dropdown
            if (next) {
              setShowSearch(false);
            }

            // reset to default rating when closing dropdown
            if (!next) {
              const DEFAULT_SORT = 'rating';

              setSortBy(DEFAULT_SORT);

              dispatch(
                getParticipantsByContestId({
                  contest_id: contestId,
                  page: 1,
                  search,
                  sort_by: DEFAULT_SORT,
                }),
              );
            }

            return next;
          });
        }}
        genre={sortBy}
        setGenre={setSortBy}
        onGenreChange={(value: string) => {
          setSortBy(value);

          dispatch(
            getParticipantsByContestId({
              contest_id: contestId,
              page: 1,
              search,
              sort_by: value,
            }),
          );
        }}
      />

      <FlatList
        data={submissions}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshing={refreshing}
        onRefresh={onRefresh}
        removeClippedSubviews={false}
        onEndReachedThreshold={0.8}
        onEndReached={loadMore}
      />
    </SafeAreaView>
  );
};

export default ViewAllSubmissions;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  listContent: {
    paddingVertical: 10,
    paddingBottom: 40,
    flexGrow: 1,
  },

  cardWrapper: {
    marginBottom: 4,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 120,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    color: themeColors.white,
    fontSize: 18,
    fontFamily: Fonts.Bold,
    textAlign: 'center',
  },

  emptySubtitle: {
    color: '#999',
    fontSize: 14,
    fontFamily: Fonts.Regular,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  },
});
