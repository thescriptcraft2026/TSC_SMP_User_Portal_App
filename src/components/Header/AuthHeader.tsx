import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
} from 'react-native';

import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import BookMark from '../../assets/SVG/BookMark';
import Ionicons from '@react-native-vector-icons/ionicons';
import PostMenu from '../DropDown/PostMenu';
import Check from '../../assets/SVG/Check';
import FloatingDropdown from '../DropDown/FloatingDropdown';
import api from '../../../Instance/Instance';
import SortTwo from '../../assets/SVG/SortTwo';
import Sort from '../../assets/SVG/Sort';
import { formatCount } from '../../utils/date';
import Share from '../../assets/SVG/Share';
import Logout from '../../assets/SVG/Logout';

interface AuthHeaderProps {
  title?: string;
  count?: any;
  showCount?: boolean;
  onBack?: () => void;
  showBack?: boolean;
  fontSize?: number;
  showBookMark?: boolean;

  showShare?: boolean;
  onShare?: () => void;

  showMenu?: boolean;
  onMenuPress?: (e: any) => void;

  postId?: string;
  bookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
  transparent?: boolean;
  onReport?: () => void;
  style?: any;
  onEdit?: () => void;
  disabled?: boolean;

  isOwnPost?: boolean;
  isAlreadyReported?: boolean;
  onNotInterested?: () => void;
  onDelete?: () => void;
  isSubmissionThere?: boolean;

  showMarkAllRead?: boolean;
  handleMarkAllRead?: () => void;
  markAllReadDisabled?: boolean;

  showSearchIcon?: boolean;
  showGenre?: boolean;
  handleGenre?: () => void;
  showGenreIcon?: boolean;
  showGenreDropdown?: boolean;
  showSortIcon?: boolean;
  showSortTabs?: () => void;
  showSortTabsOpen?: boolean;

  showSearchOpen?: boolean;
  onSearchToggle?: () => void;

  search?: string;
  setSearch?: (text: string) => void;
  onSearch?: (text: string) => void;

  genre?: string;
  setGenre?: (value: string) => void;
  onGenreChange?: (value: string) => void;

  dropdownType?: 'genre' | 'role' | 'submissionSort';
  type?:any;

  showLogout?: boolean;
  onLogout?: () => void;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  count,
  showCount = false,
  onBack,
  showBack = true,
  fontSize = 24,
  showBookMark = false,
  showMenu = false,
  postId,
  bookmarked = false,
  onToggleBookmark,
  transparent = false,
  onReport,
  style,
  onEdit,
  disabled,
  isOwnPost,
  isAlreadyReported,
  onNotInterested,
  onDelete,
  isSubmissionThere,
  showMarkAllRead = false,
  handleMarkAllRead,
  markAllReadDisabled = false,

  showSearchIcon,
  showSortIcon,
  showSortTabsOpen,
  showGenre,
  handleGenre,
  showGenreDropdown,
  showGenreIcon,

  showSearchOpen,
  onSearchToggle,

  search = '',
  setSearch,
  onSearch,

  genre = '',
  setGenre,
  onGenreChange,

  dropdownType = 'genre',
  showSortTabs,
  onMenuPress,

  showShare = false,
  onShare,

  type,

  showLogout=false,
  onLogout,
}) => {
  const isDark = true;

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const [showSearch, setShowSearch] = useState(false);

  const [genreOptions, setGenreOptions] = useState<any[]>([]);

  const openMenu = (event: any) => {
    const { pageX, pageY } = event.nativeEvent;

    setMenuPosition({
      x: pageX,
      y: pageY,
    });

    setMenuVisible(true);
  };

  // ✅ Dynamic API
  const getDropdownData = async () => {
    try {
      if (dropdownType === 'submissionSort') {
        setGenreOptions([
          {
            label: 'Most Rates',
            value: 'rating',
          },
          {
            label: 'Top Rated',
            value: 'top_rated',
          },
          {
            label: 'Most Viewed',
            value: 'top_views',
          },
          {
            label: 'Most Liked',
            value: 'top_likes',
          },
        ]);

        return;
      }

      const endpoint = dropdownType === 'role' ? '/roles' : '/genre';

      const res = await api.get(endpoint);

      const formattedData =
        res?.data?.data?.map((item: any) => ({
          label: item?.name,
          value: item?.id,
        })) || [];

      setGenreOptions(formattedData);
    } catch (error) {
      console.log('dropdown error', error);
    }
  };

  useEffect(() => {
    getDropdownData();
  }, [dropdownType]);

  return (
    <>
      <View
        style={[
          styles.header,
          style,
          {
            marginTop: Platform.OS === 'android' ? 7 : 0,
            position: transparent ? 'absolute' : 'relative',
            top: transparent ? 0 : undefined,
            left: transparent ? 0 : undefined,
            right: transparent ? 0 : undefined,
            zIndex: transparent ? 10 : 1,
          },
        ]}
      >
        {/* LEFT - Fixed width container */}
        <View style={styles.leftContainer}>
          {showBack && (
            <TouchableOpacity
              style={[
                styles.backButton,
                {
                  backgroundColor: transparent
                    ? 'rgba(0,0,0,0.4)'
                    : isDark
                      ? '#1E1E1E'
                      : themeColors.white,
                },
              ]}
              onPress={onBack}
              activeOpacity={0.7}
            >
              <FontAwesome6
                name="arrow-left"
                size={20}
                color={transparent ? '#fff' : themeColors.white}
                iconStyle="solid"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* TITLE - Centered absolutely */}
        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.headerTitle,
              {
                fontSize,
                color: transparent ? '#fff' : themeColors.white,
              },
            ]}
            numberOfLines={1}
            ellipsizeMode='tail'
          >
            {title}
            {showCount && (
              <Text style={{ fontSize: 16 }}> ({formatCount(count ?? 0)})</Text>
            )}
          </Text>
        </View>

        {/* RIGHT - Fixed width container */}
        <View style={styles.rightContainer}>
          {/* BOOKMARK */}
          {showBookMark && (
            <TouchableOpacity
              disabled={disabled}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: transparent ? 'rgba(0,0,0,0.4)' : '#1E1E1E',
                  borderRadius: 100,
                  padding: 6,
                },
              ]}
              onPress={() => postId && onToggleBookmark?.(postId)}
            >
              <BookMark
                width={22}
                height={22}
                color={bookmarked ? themeColors.primary : themeColors.white}
                bookmarked={bookmarked}
              />
            </TouchableOpacity>
          )}

          {/* SHARE */}
          {showShare && (
            <TouchableOpacity
              disabled={disabled}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: transparent ? 'rgba(0,0,0,0.4)' : '#1E1E1E',
                  borderRadius: 100,
                  padding: 6,
                },
              ]}
              onPress={() => onShare?.()}
            >
              <Share size={22} color={themeColors.white} />
            </TouchableOpacity>
          )}

          {showLogout && (
            <TouchableOpacity
              disabled={disabled}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: transparent ? 'rgba(0,0,0,0.4)' : '#1E1E1E',
                  borderRadius: 100,
                  padding: 6,
                },
              ]}
              onPress={() => onLogout?.()}
            >
              <Logout size={22} color={themeColors.red} />
            </TouchableOpacity>
          )}

          {/* MENU */}
          {showMenu && (
            <TouchableOpacity
              onPress={e => {
                if (onMenuPress) {
                  onMenuPress(e);
                } else {
                  openMenu(e);
                }
              }}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: transparent ? 'rgba(0,0,0,0.4)' : '#1E1E1E',
                  borderRadius: 100,
                  padding: 8,
                },
              ]}
            >
              <Ionicons
                name="ellipsis-vertical"
                size={20}
                color={themeColors.white}
              />
            </TouchableOpacity>
          )}

          {showMarkAllRead && (
            <TouchableOpacity
              disabled={markAllReadDisabled}
              onPress={handleMarkAllRead}
              style={{
                opacity: markAllReadDisabled ? 0.6 : 1,
              }}
            >
              <Check
                color={
                  markAllReadDisabled
                    ? 'rgba(255,255,255,0.4)'
                    : themeColors.primary
                }
                size={25}
              />
            </TouchableOpacity>
          )}

          {/* SEARCH ICON */}
          {showSearchIcon && (
            <TouchableOpacity style={styles.iconBtn} onPress={onSearchToggle}>
              <Ionicons
                name={showSearchOpen ? 'close' : 'search-outline'}
                size={20}
                color={themeColors.white}
              />
            </TouchableOpacity>
          )}

          {showGenreIcon && (
            <TouchableOpacity onPress={handleGenre} style={styles.iconBtn}>
              {showGenreDropdown ? (
                <Ionicons name="close" size={20} color={themeColors.white} />
              ) : (
                <SortTwo size={20} color={themeColors.white} />
              )}
            </TouchableOpacity>
          )}

          {showSortIcon && (
            <TouchableOpacity onPress={showSortTabs} style={styles.iconBtn}>
              {showSortTabsOpen ? (
                <Ionicons name="close" size={20} color={themeColors.white} />
              ) : (
                <Sort size={20} color={themeColors.white} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingHorizontal: 10,
        }}
      >
        {showSearchOpen && (
          <View style={styles.searchWrapper}>
            <View style={styles.searchContainer}>
              <Ionicons
                name="search-outline"
                size={18}
                color="rgba(255,255,255,0.5)"
              />

              <TextInput
                value={search}
                onChangeText={text => {
                  setSearch?.(text);
                  onSearch?.(text);
                }}
                placeholder="Search..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                style={styles.searchInput}
              />
              {!!search && (
                <TouchableOpacity
                  onPress={() => {
                    setSearch?.('');
                    onSearch?.('');
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color="rgba(255,255,255,0.6)"
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {showGenreDropdown && (
          <View style={styles.genreWrapper}>
            <FloatingDropdown
              label={
                dropdownType === 'role'
                  ? 'All Roles'
                  : dropdownType === 'submissionSort'
                    ? 'Sort By'
                    : 'All Genres'
              }
              value={genre}
              onChange={(item: any) => {
                const selectedValue = item?.value || item;

                setGenre?.(selectedValue);
                onGenreChange?.(selectedValue);
              }}
              options={genreOptions}
              style={{
                height: 35,
                borderRadius: 10,
                marginBottom: 6,
              }}
            />
          </View>
        )}
      </View>

      {/* MENU */}
      {showMenu && (
        <PostMenu
          visible={menuVisible}
          x={menuPosition.x}
          y={menuPosition.y}
          bookmarked={bookmarked}
          onToggleBookmark={() => onToggleBookmark?.(postId!)}
          onClose={() => setMenuVisible(false)}
          onReport={() => {
            setMenuVisible(false);
            onReport?.();
          }}
          onEdit={onEdit}
          onDelete={onDelete}
          onNotInterested={() => {
            setMenuVisible(false);
            onNotInterested?.();
          }}
          isOwnPost={isOwnPost}
          isAlreadyReported={isAlreadyReported}
          isSubmissionThere={isSubmissionThere}
          type={type || "Post"}
        />
      )}
    </>
  );
};

export default AuthHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Add this
    paddingHorizontal: 10,
    paddingBottom: 6,
    position: 'relative', // Add this
  },

  leftContainer: {
    width: 90,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontFamily: Fonts.Bold,
  },

  rightContainer: {
    width: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  iconBtn: {
    // padding: 6,
    marginLeft: 10,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // searchContainer: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   backgroundColor: '#1A1A1A',
  //   marginHorizontal: 10,
  //   paddingHorizontal: 12,
  //   borderRadius: 10,
  //   borderWidth: 1,
  //   borderColor: 'rgba(255,255,255,0.1)',
  //   height: 35,
  //   marginBottom: 6,
  // },

  searchInput: {
    flex: 1,
    color: themeColors.white,
    marginLeft: 10,
    fontSize: 14,
    fontFamily: Fonts.Regular,
  },

  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 8,
  },

  searchWrapper: {
    flex: 6, // 60%
  },

  genreWrapper: {
    flex: 4, // 40%
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    height: 40,
    marginBottom: 6,
  },
});
