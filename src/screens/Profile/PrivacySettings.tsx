import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  StatusBar,
  Platform,
  UIManager,
  LayoutAnimation,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import AuthHeader from '../../components/Header/AuthHeader';

import { useDispatch, useSelector } from 'react-redux';
import {
  setLocalPrivacy,
  updatePrivacySettings,
} from '../../redux/slices/privacySettingSlice';

import debounce from 'lodash.debounce';
import { useFocusEffect } from '@react-navigation/native';
const OPTIONS = ['Public', 'Followers', 'Connections', 'Private'];

const PrivacySettings = ({ navigation }: any) => {
  const isDark = true;
  const dispatch = useDispatch<any>();
  const [expandedCard, setExpandedCard] = useState('');
  useEffect(() => {
    if (
      Platform.OS === 'android' &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const toggleCard = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setExpandedCard(prev => (prev === key ? '' : key));
  };

  const { data, saving } = useSelector((state: any) => state.privacySetting);

  const { user } = useSelector((state: any) => state.auth);

  // 🔥 INIT FROM AUTH (VERY IMPORTANT)
  useFocusEffect(
    useCallback(() => {
      if (!data?.email_visibility && user) {
        dispatch(
          setLocalPrivacy({
            profile_visibility: user.profile_visibility || 'public',

            connections_visibility:
              user.connections_visibility || 'connections',

            content_visibility: user.content_visibility || 'followers',

            email_visibility: user.email_visibility || 'public',

            phone_visibility: user.phone_visibility || 'public',

            dob_visibility: user.dob_visibility || 'public',
          }),
        );
      }
    }, [user, data, dispatch]),
  );

  // 🔁 HELPERS
  const toAPI = (v: string) => v.toLowerCase();
  const toUI = (v: string) =>
    v ? v.charAt(0).toUpperCase() + v.slice(1) : 'Public';

  // 🔥 DEBOUNCED SAVE
  const debouncedSave = useMemo(() => {
    return debounce((payload: any) => {
      dispatch(updatePrivacySettings(payload));
    }, 500);
  }, [dispatch]);

  // 🔥 CLEANUP
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  // 🔥 CHANGE HANDLER
  const handleChange = (type: string, value: string) => {
    const updatedData = {
      ...data,
      [type]: toAPI(value),
    };

    // ✅ instant UI
    dispatch(setLocalPrivacy(updatedData));

    // ✅ full payload API
    debouncedSave(updatedData);
  };

  // 🔥 RENDER OPTIONS
  const getOptionMeta = (option: string) => {
    switch (option) {
      case 'Public':
        return {
          icon: 'earth-outline',
          desc: 'Anyone can view this',
        };

      case 'Followers':
        return {
          icon: 'people-outline',
          desc: 'Only your followers',
        };

      case 'Connections':
        return {
          icon: 'git-network-outline',
          desc: 'Only your connections',
        };

      case 'Private':
        return {
          icon: 'lock-closed-outline',
          desc: 'Visible only to you',
        };

      default:
        return {
          icon: 'shield-outline',
          desc: '',
        };
    }
  };

  const renderOption = (selected: string, type: string) => {
    return OPTIONS.map(option => {
      const isSelected = toUI(selected) === option;

      const meta = getOptionMeta(option);

      return (
        <TouchableOpacity
          key={option}
          activeOpacity={0.8}
          onPress={() => handleChange(type, option)}
          style={[styles.modernOptionCard, isSelected && styles.selectedCard]}
        >
          {/* LEFT */}
          <View style={styles.optionLeft}>
            <View
              style={[
                styles.optionIconWrap,
                isSelected && styles.selectedIconWrap,
              ]}
            >
              <Ionicons
                name={meta.icon as any}
                size={18}
                color={isSelected ? '#000' : themeColors.primary}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.modernOptionTitle,
                  {
                    color: isSelected ? '#fff' : '#fff',
                  },
                ]}
              >
                {option}
              </Text>

              <Text style={styles.modernOptionDesc}>{meta.desc}</Text>
            </View>
          </View>

          {/* RADIO */}
          <View
            style={[
              styles.modernRadioOuter,
              isSelected && styles.modernRadioOuterActive,
            ]}
          >
            {isSelected && <View style={styles.modernRadioInner} />}
          </View>
        </TouchableOpacity>
      );
    });
  };

  // 🔥 CARD COMPONENT
  const Card = ({ icon, title, subtitle, children, cardKey }: any) => {
    const isExpanded = expandedCard === cardKey;

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: themeColors.background,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => toggleCard(cardKey)}
          style={[
            styles.cardHeader,
            isExpanded && {
              borderBottomWidth: 0.5,
              borderBottomColor: isDark
                ? themeColors.border
                : themeColors.card3,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: `${String(themeColors.primary)}15` },
              ]}
            >
              {icon}
            </View>

            <View>
              <Text
                style={[styles.cardTitle, { color: isDark ? '#fff' : '#000' }]}
              >
                {title}
              </Text>

              <Text style={styles.cardSubtitle}>{subtitle}</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => toggleCard(cardKey)}
          >
            <Ionicons
              name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
              size={18}
              color={'#fff'}
            />
          </TouchableOpacity>
        </TouchableOpacity>

        {isExpanded && (
          <View style={{ marginTop: 12, paddingHorizontal: 16 }}>
            {children}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? themeColors.black
            : themeColors.appBackground,
        },
      ]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar barStyle="light-content" translucent />
      <AuthHeader
        title="Privacy Settings"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Card
          cardKey="profile_visibility"
          icon={
            <Ionicons
              name="image-outline"
              size={20}
              color={themeColors.primary}
            />
          }
          title="Profile Photo"
          subtitle="Who can see your display picture"
        >
          {renderOption(data.profile_visibility, 'profile_visibility')}
        </Card>

        <Card
          cardKey="connections_visibility"
          icon={
            <Ionicons
              name="people-outline"
              size={20}
              color={themeColors.primary}
            />
          }
          title="Connections"
          subtitle="Control visibility of your network"
        >
          {renderOption(data.connections_visibility, 'connections_visibility')}
        </Card>

        <Card
          cardKey="content_visibility"
          icon={
            <Ionicons
              name="newspaper-outline"
              size={20}
              color={themeColors.primary}
            />
          }
          title="Content"
          subtitle="Who can see your posts and activity"
        >
          {renderOption(data.content_visibility, 'content_visibility')}
        </Card>

        <Card
          cardKey="phone_visibility"
          icon={
            <Ionicons
              name="call-outline"
              size={20}
              color={themeColors.primary}
            />
          }
          title="Phone Number"
          subtitle="Who can see your phone number"
        >
          {renderOption(data.phone_visibility, 'phone_visibility')}
        </Card>

        <Card
          cardKey="email_visibility"
          icon={
            <Ionicons
              name="mail-outline"
              size={20}
              color={themeColors.primary}
            />
          }
          title="Email"
          subtitle="Who can see your email"
        >
          {renderOption(data.email_visibility, 'email_visibility')}
        </Card>




        <Card
          cardKey="dob_visibility"
          icon={
            <Ionicons
              name="calendar-outline"
              size={20}
              color={themeColors.primary}
            />
          }
          title="Date of Birth"
          subtitle="Who can see your DOB"
        >
          {renderOption(data.dob_visibility, 'dob_visibility')}
        </Card>







        {saving && <Text style={styles.savingText}>Saving...</Text>}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacySettings;

const styles = StyleSheet.create({
  container: { flex: 1 },

  card: {
    marginHorizontal: 14,
    marginTop: 7,
    borderRadius: 12,
    paddingVertical: 10,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
    paddingHorizontal: 12,
  },

  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  cardTitle: {
    fontSize: 16,
    fontFamily: Fonts.Bold,
  },

  cardSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },

  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
  },

  optionText: {
    fontSize: 15,
    fontFamily: Fonts.Regular,
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: themeColors.primary,
  },

  savingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 13,
    color: '#888',
  },

  modernOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,

    marginBottom: 7,

    backgroundColor: 'rgba(255,255,255,0.03)',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  selectedCard: {
    backgroundColor: 'rgba(245,179,37,0.10)',
    borderColor: 'rgba(245,179,37,0.35)',
  },

  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  optionIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 14,

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: 'rgba(255,255,255,0.05)',

    marginRight: 12,
  },

  selectedIconWrap: {
    backgroundColor: themeColors.primary,
  },

  modernOptionTitle: {
    fontSize: 16,
    fontFamily: Fonts.Bold,
  },

  modernOptionDesc: {
    fontSize: 12,
    color: '#8F8F8F',
    fontFamily: Fonts.Regular,
  },

  modernRadioOuter: {
    width: 20,
    height: 20,
    borderRadius: 100,

    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',

    justifyContent: 'center',
    alignItems: 'center',
  },

  modernRadioOuterActive: {
    borderColor: themeColors.primary,
  },

  modernRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 100,
    backgroundColor: themeColors.primary,
  },
});
