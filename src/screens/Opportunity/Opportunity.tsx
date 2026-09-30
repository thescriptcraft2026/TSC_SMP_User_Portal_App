import {
  Animated,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { themeColors } from '../../theme/colors';
import OpportunityCard from './components/card/OpportunityCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import OpportunityCardSkeleton from './components/OpportunityCardSkeleton';
import { useDispatch, useSelector } from 'react-redux';
import {
  getMyOpportunities,
  getOpportunityMySubmissions,
  getOpportunitys,
} from '../../redux/slices/opportunitySlice';
import Tabs from '../../components/Tabs/Tabs';
import { Fonts } from '../../constants/Fonts';
import ArrowUpRight from '../../assets/SVG/ArrowUpRight';
import NoData from '../../assets/SVG/NoData';
import AuthHeader from '../../components/Header/AuthHeader';
import Plus from '../../assets/SVG/Plus';
import Thumb from '../../assets/SVG/Thumb';
import Laptop from '../../assets/SVG/Laptop';

const Opportunity = () => {
  const isDark = true;
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const [sortBy, setSortBy] = useState('all');
  const [activeTab, setActiveTab] = useState('');
  const TABS = ['OnSite', 'Remote', 'Hybrid'];
  const [showMyOpps, setShowMyOpps] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const handleBack = () => navigation.goBack();
  const [search, setSearch] = useState('');
  const [roleId, setRoleId] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Redux
  const {
    opportunitys,
    loading,
    page,
    hasMore,

    mySubmissions,
    mySubmissionsLoading,
    mySubmissionsPage,
    mySubmissionsHasMore,
  } = useSelector((state: any) => state.opportunity);
  const { user: authUser } = useSelector((state: any) => state.auth);

  // Fetch all the opportunitys from api
  useFocusEffect(
    useCallback(() => {
      if (showMyOpps) return;

      dispatch(
        getOpportunitys({
          page: 1,
          source: sortBy,
          search,
          categoryId: roleId,
        }),
      );
    }, [sortBy, search, roleId, showMyOpps]),
  );

  const loadMore = () => {
    if (loading || !hasMore) return;

    if (showMyOpps) {
      dispatch(
        getMyOpportunities({
          page: page + 1,
          username: authUser?.user_name,
        }),
      );
    } else {
      dispatch(
        getOpportunitys({
          page: page + 1,
          source: sortBy,
          search,
          categoryId: roleId,
        }),
      );
    }
  };

  // ✅ Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);

    if (showMyOpps) {
      await dispatch(
        getOpportunityMySubmissions({
          page: 1,
        }),
      );
    } else {
      await dispatch(
        getOpportunitys({
          page: 1,
          source: sortBy,
          search,
          categoryId: roleId,
        }),
      );
    }

    setRefreshing(false);
  };

  // ✅ Function to close search and reset everything
  const handleCloseSearch = () => {
    setShowSearch(false);
    setSearch('');

    if (!showMyOpps) {
      dispatch(
        getOpportunitys({
          page: 1,
          source: sortBy,
          search: '',
          categoryId: roleId,
        }),
      );
    }
  };

  // ✅ Function to close role dropdown and reset everything
  const handleCloseRole = () => {
    setShowRoleDropdown(false);
    setRoleId('');

    if (!showMyOpps) {
      dispatch(
        getOpportunitys({
          page: 1,
          source: sortBy,
          search: search,
          categoryId: '',
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

  // ✅ Toggle role dropdown with reset on close
  const handleRoleToggle = () => {
    if (showRoleDropdown) {
      // Closing role dropdown - reset everything
      handleCloseRole();
    } else {
      // Opening role dropdown
      setShowRoleDropdown(true);
    }
  };

  const renderFooter = () => {
    if (
      (showMyOpps && mySubmissionsLoading && mySubmissionsPage > 1) ||
      (!showMyOpps && loading && page > 1)
    ) {
      return (
        <View style={{ paddingVertical: 20 }}>
          <OpportunityCardSkeleton />
        </View>
      );
    }

    if (
      (showMyOpps && !mySubmissionsHasMore && mySubmissions.length > 0) ||
      (!showMyOpps && !hasMore && opportunitys.length > 0)
    ) {
      return (
        <Text
          style={{
            textAlign: 'center',
            padding: 20,
            opacity: 0.6,
            color: themeColors.white,
          }}
        >
          🎉 You've reached the end
        </Text>
      );
    }

    return null;
  };

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={{ alignItems: 'center', marginTop: 100, flex: 1 }}>
        {showMyOpps ? <Thumb /> : <Laptop />}
        <Text
          style={{
            color: themeColors.primary,
            marginTop: 10,
            fontFamily: Fonts.Medium,
            fontSize: 16,
          }}
        >
          {showMyOpps
            ? 'Oops! No opportunities applied yet'
            : 'Oops! No Opportunities Found'}
        </Text>
      </View>
    );
  };

  const hideHeader =
    showSearch &&
    search.trim().length > 0 &&
    !showMyOpps &&
    opportunitys.length === 0 &&
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
      <SafeAreaView style={[styles.flex]} edges={['left', 'right', 'top']}>
        <StatusBar
          translucent
          barStyle={'light-content'}
        />
        <AuthHeader
          showBack
          title="Opportunities"
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
              dispatch(
                getOpportunitys({
                  page: 1,
                  source: sortBy,
                  search: text,
                  categoryId: roleId,
                }),
              );
            }
          }}
          // ✅ Role props
          showGenreIcon={true}
          showGenreDropdown={showRoleDropdown}
          handleGenre={handleRoleToggle}
          genre={roleId}
          setGenre={setRoleId}
          onGenreChange={(value: string) => {
            setRoleId(value);

            if (!showMyOpps) {
              dispatch(
                getOpportunitys({
                  page: 1,
                  source: sortBy,
                  search: search,
                  categoryId: value,
                }),
              );
            }
          }}
          dropdownType="role"
        />

        <FlatList
          ListEmptyComponent={
            loading ? (
              <>
                <OpportunityCardSkeleton />
                <OpportunityCardSkeleton />
                <OpportunityCardSkeleton />
              </>
            ) : (
              renderEmpty()
            )
          }
          ListHeaderComponent={
            !hideHeader ? (
              <View style={styles.headerRow}>
                {/* 🔹 Right: Tabs */}
                <Tabs
                  tabs={TABS}
                  activeTab={activeTab}
                  onChange={tab => {
                    if (showMyOpps) return;
                    if (activeTab === tab) {
                      setActiveTab('');
                      setSortBy('all');
                      dispatch(
                        getOpportunitys({
                          page: 1,
                          source: 'all',
                          search,
                          categoryId: roleId,
                        }),
                      );
                      return;
                    }

                    setActiveTab(tab);

                    let newSort = 'all';
                    if (tab === 'OnSite') newSort = 'onsite';
                    if (tab === 'Remote') newSort = 'remote';
                    if (tab === 'Hybrid') newSort = 'hybrid';

                    setSortBy(newSort);
                    dispatch(
                      getOpportunitys({
                        page: 1,
                        source: newSort,
                        search,
                        categoryId: roleId,
                      }),
                    );
                  }}
                />
                {/* 🔹 Left: My Opportunity Button */}
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                  onPress={() => {
                    if (showMyOpps) {
                      // 🔙 go back to all
                      setShowMyOpps(false);
                      // Close search and role dropdown when switching
                      setShowSearch(false);
                      setShowRoleDropdown(false);
                      dispatch(
                        getOpportunitys({
                          page: 1,
                          source: sortBy,
                          search,
                          categoryId: roleId,
                        }),
                      );
                    } else {
                      // 🔥 load my opps
                      setShowMyOpps(true);
                      setShowSearch(false);
                      setShowRoleDropdown(false);
                      dispatch(
                        getOpportunityMySubmissions({
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
                        color: isDark
                          ? themeColors.primary
                          : themeColors.primary,
                      },
                    ]}
                  >
                    {showMyOpps ? 'All Opportunities' : 'My Submissions'}
                  </Text>
                  <ArrowUpRight
                    color={isDark ? themeColors.primary : themeColors.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => {
                    navigation.navigate('AddOpportunity');
                  }}
                >
                  <Plus size={28} />
                </TouchableOpacity>
              </View>
            ) : null
          }
          data={showMyOpps ? mySubmissions : opportunitys}
          keyExtractor={item => item?.id?.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
          // 🔥 Performance
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={10}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          // ListEmptyComponent={renderEmpty}
          renderItem={({ item }) => (
            <OpportunityCard
              data={showMyOpps ? item?.opportunity : item}
              onPress={() => {
                navigation.navigate('SingleOpportunityDetails', {
                  opp_id: item?.opp_id || item?.opportunity?.opp_id,
                });
              }}
            />
          )}
        />
      </SafeAreaView>
    </View>
  );
};

export default Opportunity;

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
    marginHorizontal: 10,
  },

  myOppBtn: {
    fontSize: 12,
    fontFamily: Fonts.Bold,
  },
  addBtn: {
    backgroundColor: themeColors.primary,
    padding: 2,
    borderRadius: 100,
    marginLeft: 10,
  },
});
