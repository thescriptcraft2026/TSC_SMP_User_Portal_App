import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import Avatar from '../../../components/Avatar/Avatar';
import { themeColors } from '../../../theme/colors';
import { Fonts } from '../../../constants/Fonts';
import { useNavigation } from '@react-navigation/native';
import Chat from '../../../assets/SVG/Chat';

const ConnectionItem = ({
  item,
  type,
  updateRelation,
  onProfileView,
  currentUserName,
  startChat,
}: any) => {
  const isDark = true;
  const navigation = useNavigation<any>();
  const isSelf = item.user_name === currentUserName;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? themeColors.card2 : themeColors.white,
        },
      ]}
    >
      <TouchableOpacity style={styles.left} onPress={onProfileView}>
        <Avatar uri={item.avatar} name={item.name} size={50} />

        <View style={{ marginLeft: 10 }}>
          {/* 👤 Name */}
          <Text style={[styles.name, { color: isDark ? '#fff' : '#111' }]}>
            {item.name}
          </Text>

          {/* 🏷️ Username */}
          <Text style={[styles.username, { color: isDark ? '#aaa' : '#666' }]}>
            @{item.user_name}
          </Text>

          {/* 🎭 Roles */}
          <Text style={[styles.role, { color: isDark ? '#888' : '#777' }]}>
            {Array.isArray(item.roles) && item.roles.length > 0
              ? item.roles
                  ?.slice(0, 2)
                  .map((r: any) => r.name)
                  .join(', ')
              : 'No roles'}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.actions}>
        {isSelf ? (
          <View style={styles.outlineBtn}>
            <Text style={styles.outlineText}>You</Text>
          </View>
        ) : (
          <>
            {/* FOLLOWERS */}
            {type === 'followers' &&
              (item.followedByYou ? (
                <TouchableOpacity
                  style={styles.outlineBtn}
                  onPress={() => updateRelation(item.id, 'unfollow')}
                >
                  <Text style={styles.outlineText}>Following</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => updateRelation(item.id, 'follow')}
                >
                  <Text style={styles.primaryText}>Follow</Text>
                </TouchableOpacity>
              ))}

            {/* FOLLOWING */}
            {type === 'following' &&
              (item.followedByYou ? (
                <TouchableOpacity
                  style={styles.outlineBtn}
                  onPress={() => updateRelation(item.id, 'unfollow')}
                >
                  <Text style={styles.outlineText}>Unfollow</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => updateRelation(item.id, 'follow')}
                >
                  <Text style={styles.primaryText}>Follow</Text>
                </TouchableOpacity>
              ))}

            {/* CONNECTION */}
            {type === 'connection' && (
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => startChat(item)}
              >
                <Chat size={18} color="#fff" />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default ConnectionItem;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  name: { fontSize: 15, fontFamily: Fonts.Bold },
  username: {
    fontSize: 12,
    fontFamily: Fonts.Medium,
  },
  role: { fontSize: 12, fontFamily: Fonts.Regular },
  actions: { flexDirection: 'row' },

  primaryBtn: {
    backgroundColor: themeColors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  primaryText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: Fonts.Bold,
  },

  outlineBtn: {
    borderWidth: 1,
    borderColor: themeColors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
  },
  outlineText: {
    color: themeColors.primary,
    fontSize: 12,
    fontFamily: Fonts.Bold,
  },
});
