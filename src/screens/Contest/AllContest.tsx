import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { themeColors } from '../../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Fonts } from '../../constants/Fonts';
import AuthHeader from '../../components/Header/AuthHeader';
import ContestSkeleton from '../../components/Contest/ContestSkeleton';
import ContestCard from '../../components/Contest/ContestCard';
import {
  getAllContest,
  getContestBanner,
  getMyParticipatedContestsThunk,
  resetContest,
  startContestLoading,
  toggleContestBookmark,
} from '../../redux/slices/contestSlice';
import Tabs from '../../components/Tabs/Tabs';
import ArrowUpRight from '../../assets/SVG/ArrowUpRight';
import { formatDate } from '../../utils/date';
import { getContestStatus, getDaysLeftFromNow } from '../../utils/contest';
import Dart from '../../assets/SVG/Dart';
import { useToast } from '../../components/Toast/ToastProvider';
import { useShare } from '../../hooks/useShare';
import ContestBannerSwiper from './components/ContestBannerSwiper';

const CONTEST_TABS = ['Ongoing', 'Upcoming', 'Completed'];
const { width } = Dimensions.get('window');

const AllContest = () => {
  const isDark = true;
  const route = useRoute<any>();

  const showMySubmissions =
    route?.params?.showMySubmissions === true ||
    route?.params?.showMySubmissions === 'true';

  const { show } = useToast();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [contestTab, setContestTab] = useState('Ongoing');
  const [sortBy, setSortBy] = useState('ongoing');
  const [showMyOpps, setShowMyOpps] = useState(false);
  const [search, setSearch] = useState('');
  const [genreId, setGenreId] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const onEndReachedCalledDuringMomentum = useRef(false);
  const isFetchingMore = useRef(false);
  const { handleShare } = useShare({});

  const handleBack = () => navigation.goBack();

  /* ---------------- REDUX ---------------- */

  const {
    contest,
    myParticipatedContests,
    loading,
    page,
    hasMore,
    bannerData,
  } = useSelector((state: any) => state.contest);

  /* ---------------- INITIAL FETCH ---------------- */

  // useFocusEffect(
  //   useCallback(() => {
  //     if (showMyOpps) return;

  //     dispatch(resetContest());

  //     dispatch(
  //       getAllContest({
  //         page: 1,
  //         sort_by: sortBy,
  //         search,
  //         genre_id: genreId,
  //       }),
  //     );
  //     // Fetch contest banners
  //     dispatch(getContestBanner());
  //   }, [dispatch, sortBy, search, genreId, showMyOpps]),
  // );

  useFocusEffect(
    useCallback(() => {
      if (showMySubmissions) {
        setShowMyOpps(true);
        setContestTab('');

        dispatch(
          getMyParticipatedContestsThunk({
            page: 1,
          }),
        );

        return;
      }

      if (showMyOpps) return;

      dispatch(resetContest());

      dispatch(
        getAllContest({
          page: 1,
          sort_by: sortBy,
          search,
          genre_id: genreId,
        }),
      );

      dispatch(getContestBanner());
    }, [dispatch, sortBy, search, genreId, showMyOpps, showMySubmissions]),
  );

  /* ---------------- LOAD MORE ---------------- */

  const loadMore = async () => {
    if (loading || !hasMore || showMyOpps || isFetchingMore.current) {
      return;
    }

    isFetchingMore.current = true;

    try {
      await dispatch(
        getAllContest({
          page: page + 1,
          sort_by: sortBy,
          search,
          genre_id: genreId,
        }),
      );
    } catch (e) {
      console.log('pagination error', e);
    } finally {
      isFetchingMore.current = false;
    }
  };

  /* ---------------- REFRESH ---------------- */

  const onRefresh = async () => {
    setRefreshing(true);

    if (showMyOpps) {
      await dispatch(
        getMyParticipatedContestsThunk({
          page: 1,
        }),
      );
    } else {
      dispatch(resetContest());

      await dispatch(
        getAllContest({
          page: 1,
          sort_by: sortBy,
          search,
          genre_id: genreId,
        }),
      );
    }

    setRefreshing(false);
  };

  /* ---------------- DATA ---------------- */

  const contestData = useMemo(() => {
    if (!showMyOpps) {
      return contest || [];
    }

    const seen = new Map();

    (myParticipatedContests || []).forEach((item: any) => {
      const contestId = item.contest?.id;
      if (!contestId) return;

      if (!seen.has(contestId)) {
        seen.set(contestId, {
          id: item.contest?.id,
          title: item.contest?.title,
          image: item.contest?.image,
          start_date: item.contest?.start_date,
          end_date: item.contest?.end_date,
          participants_count: item.contest?.participants_count,
          isWishlisted: item.contest?.isWishlisted,
          submissionCount: 1,
          originalSubmission: item, // latest/first submission kept
        });
      } else {
        // Same contest, another submission — just bump the count
        seen.get(contestId).submissionCount += 1;
      }
    });

    return Array.from(seen.values());
  }, [showMyOpps, myParticipatedContests, contest]);

  // ✅ Function to close search and reset everything
  const handleCloseSearch = () => {
    setShowSearch(false);
    setSearch('');

    if (!showMyOpps) {
      dispatch(resetContest());
      // Reset to first page with cleared search
      dispatch(
        getAllContest({
          page: 1,
          sort_by: sortBy,
          search: '',
          genre_id: genreId,
        }),
      );
    }
  };

  // ✅ Function to close genre dropdown and reset everything
  const handleCloseGenre = () => {
    setShowGenreDropdown(false);
    setGenreId('');

    if (!showMyOpps) {
      dispatch(resetContest());
      // Reset to first page with cleared genre
      dispatch(
        getAllContest({
          page: 1,
          sort_by: sortBy,
          search: search,
          genre_id: '',
        }),
      );
    }
  };

  // ✅ Toggle search with reset on close
  const handleSearchToggle = () => {
    if (showSearch) {
      // Closing search - reset everything
      handleCloseSearch();
    } else {
      // Opening search
      setShowSearch(true);
    }
  };

  const handleBookmark = async (item: any) => {
    try {
      const res: any = await dispatch(
        toggleContestBookmark({
          contest_id: item.id,
          type: item.isWishlisted ? 'delete' : 'create',
        }),
      );

      if (res.meta.requestStatus === 'fulfilled') {
        dispatch(resetContest());

        dispatch(
          getAllContest({
            page: 1,
            sort_by: sortBy,
            search,
            genre_id: genreId,
          }),
        );
      }
    } catch (error) {
      show({
        type: 'error',
        title: 'Something went wrong',
      });
    }
  };

  // ✅ Toggle genre dropdown with reset on close
  const handleGenreToggle = () => {
    if (showGenreDropdown) {
      // Closing genre dropdown - reset everything
      handleCloseGenre();
    } else {
      // Opening genre dropdown
      setShowGenreDropdown(true);
    }
  };

  const bannerDataSorted = useMemo(() => {
    const banners = Array.isArray(bannerData) ? bannerData : [];

    return banners
      ?.filter((item: any) => item?.status === 'active' && !!item?.image)
      ?.sort(
        (a: any, b: any) => Number(a?.position ?? 0) - Number(b?.position ?? 0),
      );
  }, [bannerData]);

  const hasUpcomingBanners =
    contestTab === 'Upcoming' && !showMyOpps && bannerDataSorted?.length > 0;

  /* ---------------- FOOTER ---------------- */

  const renderFooter = () => {
    if (loading && page > 1) {
      return (
        <View style={{ paddingVertical: 20 }}>
          <ContestSkeleton />
        </View>
      );
    }

    // if (!hasMore && contestData.length > 0 && !showMyOpps) {
    //   return (
    //     <Text
    //       style={{
    //         textAlign: 'center',
    //         padding: 20,
    //         opacity: 0.6,
    //         color: themeColors.white,
    //       }}
    //     >
    //       🎉 You've reached the end
    //     </Text>
    //   );
    // }

    return null;
  };

  const hideHeader =
    showSearch &&
    search.trim().length > 0 &&
    contestData.length === 0 &&
    !loading;

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
      <SafeAreaView style={styles.flex} edges={['left', 'right', 'top']}>
        <StatusBar translucent barStyle="light-content" />

        <AuthHeader
          showBack
          title="Contests"
          onBack={handleBack}
          // ✅ Search props
          showSearchIcon={true}
          showSearchOpen={showSearch}
          onSearchToggle={handleSearchToggle}
          search={search}
          setSearch={setSearch}
          onSearch={(text: string) => {
            setSearch(text);

            if (!showMyOpps) {
              dispatch(resetContest());
              dispatch(
                getAllContest({
                  page: 1,
                  sort_by: sortBy,
                  search: text,
                  genre_id: genreId,
                }),
              );
            }
          }}
        />

        {loading && contestData.length === 0 ? (
          <FlatList
            data={[1, 2, 3, 4, 5]}
            keyExtractor={item => item.toString()}
            renderItem={() => <ContestSkeleton />}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            data={contestData}
            keyExtractor={(item, index) => `${item?.id}-${index}`}
            renderItem={({ item }) => {
              if (!item?.id) return null;
              return (
                <ContestCard
                  title={item?.title}
                  image={item?.image}
                  participants={item?.participants_count}
                  bookmarked={item?.isWishlisted === 1}
                  startDate={formatDate(item?.start_date)}
                  endDate={formatDate(item?.end_date)}
                  status={getContestStatus(item?.start_date, item?.end_date)}
                  daysLeft={getDaysLeftFromNow(item?.end_date)}
                  onPress={() => {
                    navigation.navigate('ContestDetails', {
                      contestId: item?.id,
                      showMySubmissions: true,
                    });
                  }}
                  onBookMark={() => handleBookmark(item)}
                  onShare={() => {
                    handleShare({
                      title: item?.title,
                      value: item?.id,
                      type: 'contest',
                    });
                  }}
                />
              );
            }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 80,
              flexGrow: contestData?.length === 0 ? 1 : undefined,
            }}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListFooterComponent={renderFooter}
            onEndReachedThreshold={0.3}
            onMomentumScrollBegin={() => {
              onEndReachedCalledDuringMomentum.current = false;
            }}
            onEndReached={() => {
              if (!onEndReachedCalledDuringMomentum.current && !showMyOpps) {
                loadMore();
                onEndReachedCalledDuringMomentum.current = true;
              }
            }}
            ListHeaderComponent={
              !hideHeader ? (
                <View>
                  {/* Tabs */}
                  <View
                    style={[
                      styles.headerRow,
                      {
                        justifyContent: 'space-between',
                      },
                    ]}
                  >
                    <Tabs
                      tabs={CONTEST_TABS}
                      marginVertical={0}
                      activeTab={contestTab}
                      onChange={tab => {
                        if (showMyOpps) {
                          setShowMyOpps(false);
                        }

                        setContestTab(tab);

                        let newSort = 'ongoing';

                        switch (tab) {
                          case 'Upcoming':
                            newSort = 'upcoming';
                            break;

                          case 'Completed':
                            newSort = 'completed';
                            break;

                          default:
                            newSort = 'ongoing';
                        }

                        onEndReachedCalledDuringMomentum.current = true;

                        dispatch(startContestLoading());
                        dispatch(resetContest());

                        setSortBy(newSort);

                        dispatch(
                          getAllContest({
                            page: 1,
                            sort_by: newSort,
                            search,
                            genre_id: genreId,
                          }),
                        );
                      }}
                    />

                    <TouchableOpacity
                      style={styles.myContestBtn}
                      onPress={() => {
                        if (showMyOpps) {
                          setShowMyOpps(false);

                          dispatch(resetContest());

                          dispatch(
                            getAllContest({
                              page: 1,
                              sort_by: sortBy,
                              search,
                              genre_id: genreId,
                            }),
                          );
                        } else {
                          setShowMyOpps(true);
                          setContestTab('');

                          dispatch(
                            getMyParticipatedContestsThunk({
                              page: 1,
                            }),
                          );
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.myOppBtn,
                          {
                            color: themeColors.primary,
                          },
                        ]}
                      >
                        {showMyOpps ? 'All Contests' : 'My Contests'}
                      </Text>

                      <ArrowUpRight color={themeColors.primary} />
                    </TouchableOpacity>
                  </View>

                  {/* ADMIN CAROUSEL - ONLY UPCOMING */}
                  {contestTab === 'Upcoming' &&
                    !showMyOpps &&
                    bannerDataSorted.length > 0 && (
                      <ContestBannerSwiper
                        data={bannerDataSorted}
                        cardWidth={width * 0.8}
                        cardHeight={width * 0.8}
                        spacing={0}
                        autoPlay
                        autoPlayInterval={3000}
                      />
                    )}
                </View>
              ) : null
            }
            ListEmptyComponent={
              !loading && !hasUpcomingBanners ? (
                <View style={styles.emptyContainer}>
                  <Dart />

                  <Text style={styles.emptyTitle}>
                    {showMyOpps
                      ? 'No Contests Participate Yet'
                      : 'Oops! No Contests Found !'}
                  </Text>
                </View>
              ) : null
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
};

export default AllContest;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  flex: {
    flex: 1,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginVertical: 10,
  },

  myContestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  myOppBtn: {
    fontSize: 12,
    fontFamily: Fonts.Bold,
  },

  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 120,
    paddingHorizontal: 30,
  },

  emptyEmoji: {
    fontSize: 52,
    marginBottom: 14,
  },

  emptyTitle: {
    color: themeColors.primary,
    fontSize: 16,
    fontFamily: Fonts.Medium,
    textAlign: 'center',
    marginTop: 10,
  },

  emptySubtitle: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: Fonts.Regular,
  },
});
