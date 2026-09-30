import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import { useNavigation } from '@react-navigation/native';
import { useDrawer } from './DrawerLayout';
import Verified from '../../assets/SVG/Verified';
import Logout from '../../assets/SVG/Logout';
import Book from '../../assets/SVG/Book';
import Synoposys from '../../assets/SVG/Synoposys';
import VisionX from '../../assets/SVG/VisionX';
import Setting from '../../assets/SVG/Setting';
import BookMark from '../../assets/SVG/BookMark';
import Movie from '../../assets/SVG/Movie';
import LogoutModal from '../Modals/LogoutModal';
import { useDispatch, useSelector } from 'react-redux';
import { getUserThunk, logoutUser } from '../../redux/slices/authSlice';
import FastImage from 'react-native-fast-image';
import Avatar from '../Avatar/Avatar';
import { useToast } from '../Toast/ToastProvider';
import Oppurtunity from '../../assets/SVG/Oppurtunity';
import Contest from '../../assets/SVG/Contest';
import BookMarkTwo from '../../assets/SVG/BookMarkTwo';
import Tutorial from '../../assets/SVG/Tutorial';
import { verticalScaleSize } from '../../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DrawerMenu = () => {
  const navigation = useNavigation<any>();
  const { closeDrawer, open } = useDrawer();
  const isDark = useColorScheme() === 'dark';
  const [logoutModal, setLogoutModal] = useState(false);
  const dispatch = useDispatch<any>();
  const { user } = useSelector((state: any) => state.auth);
  const { show } = useToast();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (open) {
      dispatch(getUserThunk());
    }
  }, [open]);

  const navigate = (screen: string, params?: any) => {
    navigation.navigate('App', {
      screen,
      params,
    });
    closeDrawer();
  };

  const handleLogout = () => {
    closeDrawer();
    setLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      setLogoutModal(false);

      await dispatch(logoutUser()).unwrap();

      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
      show({
        type: 'success',
        title: 'Logout Successful',
      });
    } catch (error) {
      console.log('Logout Error:', error);
      show({
        type: 'error',
        title: error,
      });
    }
  };

  return (
    <>
      <View
        style={[
          styles.container,
          {
            backgroundColor: '#111119',
            paddingTop:
              Platform.OS === 'ios'
                ? insets.top + 16
                : Math.max(insets.top + 16, 30),
          },
        ]}
      >
        {/* SCROLLABLE CONTENT */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: Math.max(
              insets.bottom + verticalScaleSize(20),
              verticalScaleSize(40),
            ),
          }}
          bounces={false}
          overScrollMode="auto"
        >
          {/* PROFILE CARD */}
          <TouchableOpacity
            style={[
              styles.profileCard,
              {
                backgroundColor: themeColors.borderLight,
              },
            ]}
            onPress={() =>
              navigate('Profile', {
                username: user?.user_name || user?.user_id || user?.id,
                isOwnProfile: true,
              })
            }
          >
            <Avatar
              name={user?.name}
              uri={user?.profile_photo_path}
              size={70}
            />

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Text
                style={[styles.name, { color: themeColors.white }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {user?.name}
              </Text>
            </View>
            <Text style={[styles.username, { color: themeColors.white }]}>
              @{user?.user_name}
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: themeColors.white }]}>
                  {user?.followers_count || 0}
                </Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: themeColors.white }]}>
                  {user?.following_count || 0}
                </Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* MENU CARDS */}
          <Text style={[styles.workspaceLabel, { color: '#8e8e93' }]}>
            Workspace
          </Text>
          <View style={[styles.menuSection, { marginBottom: 10 }]}>
            <MenuCard
              icon={<Book width={22} height={22} color="#f0b100" />}
              label="Books"
              onPress={() => {
                navigate('AllBooks');
              }}
            />
            <MenuCard
              icon={<Synoposys width={22} height={22} color="#00bc7d" />}
              label="Synopses"
              onPress={() => {
                navigate('AllSynopsis');
              }}
            />
            <MenuCard
              icon={<VisionX width={22} height={22} color="#00b8db" />}
              label="Creators Zone"
              onPress={() => {
                navigate('AllVisionX');
              }}
            />
            <MenuCard
              icon={<BookMarkTwo size={21} color="#E12AFB" />}
              label="Saved"
              onPress={() => {
                navigate('BookMarks');
              }}
            />
          </View>

          <Text style={[styles.workspaceLabel, { color: '#8e8e93' }]}>
            Discover
          </Text>
          <View style={[styles.menuSection, { marginBottom: 10 }]}>
            <MenuCard
              icon={<Oppurtunity width={22} height={22} color="#8e51ff" />}
              label="Opportunities"
              onPress={() => {
                navigate('AllOpportunity');
              }}
            />
            <MenuCard
              icon={<Contest width={22} height={22} color="#2b7fff" />}
              label="Contests"
              onPress={() => {
                navigate('AllContest');
              }}
            />
            <MenuCard
              icon={<Movie width={22} height={22} color="#9810fa" />}
              label="Unfiltered"
              onPress={() => {
                navigate('AllMovies');
              }}
            />
          </View>

          <Text style={[styles.workspaceLabel, { color: '#8e8e93' }]}>
            Other's
          </Text>
          <View style={styles.menuSection}>
            <MenuCard
              icon={<Tutorial width={22} height={22} color="#2b7fff" />}
              label="Tutorials"
              onPress={() => {
                navigate('Tutorials');
              }}
            />
            <MenuCard
              icon={<Setting width={22} height={22} color={themeColors.red} />}
              label="Settings"
              onPress={() => {
                navigate('ProfileSetting');
              }}
            />
            <MenuCard
              icon={<Logout size={22} color={themeColors.red} />}
              label="Logout"
              onPress={handleLogout}
            />
          </View>
        </ScrollView>
        {/* LOGOUT */}
        {/* <View style={styles.logoutWrapper}>
          <MenuCard
            icon={<Setting width={22} height={22} color={themeColors.red} />}
            label="Settings"
            onPress={() => {
              navigate('ProfileSetting');
            }}
          />
          <View style={{ marginVertical: 3 }} />
          <MenuCard
            icon={<Logout size={22} color={themeColors.red} />}
            label="Logout"
            onPress={handleLogout}
          />
        </View> */}
      </View>
      <LogoutModal
        visible={logoutModal}
        onClose={() => setLogoutModal(false)}
        onSubmit={confirmLogout}
      />
    </>
  );
};

export default DrawerMenu;

const MenuCard = ({ icon, label, onPress }: any) => {
  const isDark = useColorScheme() === 'dark';

  return (
    <TouchableOpacity
      style={[
        styles.menuCard,
        {
          backgroundColor: themeColors.borderLight,
        },
      ]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      {icon && <View>{icon}</View>}

      <Text style={[styles.menuText, { color: themeColors.white }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingTop: 60,
    paddingHorizontal: 10,
  },
  profileCard: {
    backgroundColor: themeColors.primary,
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    marginBottom: 15,
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: themeColors.white,
  },

  name: {
    fontSize: 18,
    fontFamily: Fonts.Bold,
    color: '#fff',
  },

  username: {
    fontSize: 13,
    color: '#e8e8e8',
    marginTop: 2,
  },

  viewProfile: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },

  viewProfileText: {
    fontSize: 12,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  statItem: {
    alignItems: 'center',
    flex: 1,
  },

  statNumber: {
    fontSize: 16,
    fontFamily: Fonts.Bold,
  },

  statLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },

  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(150,150,150,0.2)',
  },

  menuSection: {
    gap: 5,
  },

  workspaceLabel: {
    fontSize: 11,
    fontFamily: Fonts.SemiBold,
    marginBottom: 10,
    marginLeft: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
  },

  menuText: {
    marginLeft: 7,
    fontSize: 15,
    fontFamily: Fonts.Medium,
  },

  logoutWrapper: {
    paddingVertical: 30,
  },

  logoutText: {
    fontSize: 20,
    fontFamily: Fonts.Medium,
  },
});
