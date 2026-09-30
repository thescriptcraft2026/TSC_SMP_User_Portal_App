import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AuthHeader from '../../../components/Header/AuthHeader';
import { themeColors } from '../../../theme/colors';
import FollowersList from './Tabs/FollowersList';
import FollowingList from './Tabs/FollowingList';
import { Fonts } from '../../../constants/Fonts';

const ConnectionsTabsScreen = () => {
  const isDark = true;
  const navigation = useNavigation<any>();

  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(
    'followers',
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: isDark ? themeColors.black : themeColors.white,
        },
      ]}
    >
      <AuthHeader
        title="Connections"
        showBack
        onBack={() => navigation.goBack()}
      />

      {/* 🔥 TABS */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'followers' && styles.activeTab]}
          onPress={() => setActiveTab('followers')}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 'followers'
                    ? themeColors.primary
                    : isDark
                    ? '#aaa'
                    : '#666',
              },
            ]}
          >
            Followers
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'following' && styles.activeTab]}
          onPress={() => setActiveTab('following')}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 'following'
                    ? themeColors.primary
                    : isDark
                    ? '#aaa'
                    : '#666',
              },
            ]}
          >
            Following
          </Text>
        </TouchableOpacity>
      </View>

      {/* 🔥 CONTENT */}
      {activeTab === 'followers' ? <FollowersList /> : <FollowingList />}
    </SafeAreaView>
  );
};

export default ConnectionsTabsScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },

  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },

  tab: {
    paddingVertical: 12,
  },

  activeTab: {
    borderBottomWidth: 2,
    borderColor: themeColors.primary,
  },

  tabText: {
    fontSize: 14,
    fontFamily: Fonts.Bold,
  },
});
