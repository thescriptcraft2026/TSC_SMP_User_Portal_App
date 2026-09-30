import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  Alert,
  Animated,
  TouchableOpacity,
  TextInput,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { themeColors } from '../../../theme/colors';
import { useToast } from '../../../components/Toast/ToastProvider';

import {
  getPrimaryRoles,
  getSecondaryRoles,
  getUserProfile,
  updatePrimaryRoles,
  updateSecondaryRoles,
} from '../../../redux/slices/profileSlice';

import AuthHeader from '../../../components/Header/AuthHeader';
import PrimaryButton from '../../../components/Buttons/PrimaryButton';
import { Fonts } from '../../../constants/Fonts';

import Feather from '@react-native-vector-icons/feather';

import { getProfileApi } from '../../../services/profileApi';

import FloatingInputTwo from '../../../components/Input/FloatingInputTwo';

const RoleEditScreen = ({ navigation }: any) => {
  const isDark = true;
  const dispatch = useDispatch<any>();
  const { show } = useToast();
  const handleBack = () => navigation.goBack();
  const textColor = isDark ? themeColors.white : themeColors.black;
  const bgColor = isDark ? themeColors.black : themeColors.white;
  const {
    primaryRoles = [],
    secondaryRoles = [],
    loading,
  } = useSelector((state: any) => state.auth);

  // ✅ ALWAYS USE LATEST PROFILE USER
  const { user: profileUser } = useSelector((state: any) => state.book);

  // ✅ PRIMARY
  const [selectedPrimary, setSelectedPrimary] = useState<number[]>([]);

  // ✅ SECONDARY
  const [selectedSecondary, setSelectedSecondary] = useState<number[]>([]);

  // ✅ CUSTOM PRIMARY
  const [customPrimaryRole, setCustomPrimaryRole] = useState('');


  // ✅ CUSTOM SECONDARY
  const [customSecondaryRole, setCustomSecondaryRole] = useState('');



  const [showCustomPrimaryInput, setShowCustomPrimaryInput] = useState(false);
  const [showCustomSecondaryInput, setShowCustomSecondaryInput] =
    useState(false);

  const [savedCustomPrimaryRoles, setSavedCustomPrimaryRoles] = useState<
    string[]
  >([]);

  const [savedCustomSecondaryRoles, setSavedCustomSecondaryRoles] = useState<
    string[]
  >([]);

  // ✅ FETCH ROLES
  useEffect(() => {
    dispatch(getPrimaryRoles());

    dispatch(getSecondaryRoles());
  }, []);

  // ✅ LOAD SELECTED ROLES
  useEffect(() => {
    if (!profileUser?.roles) {
      setSelectedPrimary([]);
      setSelectedSecondary([]);
      return;
    }

    // ✅ REMOVE DUPLICATES
    const primarySet = new Set<number>();
    const secondarySet = new Set<number>();

    profileUser.roles.forEach((role: any) => {
      const roleId = Number(role?.id || role?.role_id);

      // ✅ SKIP INVALID IDS
      if (!roleId) return;

      const isPrimary = role?.UserRole?.isPrimary === true;

      if (isPrimary) {
        primarySet.add(roleId);
      } else {
        secondarySet.add(roleId);
      }
    });

    // ✅ FINAL CLEAN ARRAYS
    setSelectedPrimary(Array.from(primarySet));
    setSelectedSecondary(Array.from(secondarySet));
  }, [profileUser?.roles]);

  // ✅ FETCH PROFILE
  useEffect(() => {
    if (!profileUser) {
      getProfileApi(profileUser?.user_name);
    }
  }, []);

  // ✅ TOGGLE PRIMARY
  const togglePrimary = (id: number) => {
    const customCount = savedCustomPrimaryRoles.length;

    if (selectedPrimary.includes(id)) {
      setSelectedPrimary(prev => prev.filter(i => i !== id));
    } else {
      const totalCount =
        selectedPrimary.length + savedCustomPrimaryRoles.length;

      if (totalCount >= 3) {
        show({
          type: 'info',
          title: 'Maximum 3 primary roles allowed',
        });
        return;
      }

      setSelectedPrimary(prev => [...prev, id]);
    }
  };

  // ✅ TOGGLE SECONDARY
  const toggleSecondary = (id: number) => {
    if (selectedSecondary.includes(id)) {
      setSelectedSecondary(prev => prev.filter(i => i !== id));
    } else {
      setSelectedSecondary(prev => [...prev, id]);
    }
  };

  // ✅ SAVE
  const handleSave = async () => {
    try {
      const totalPrimaryCount =
        selectedPrimary.length + savedCustomPrimaryRoles.length;

      if (totalPrimaryCount === 0) {
        return Alert.alert('Please select at least one primary role');
      }

      if (totalPrimaryCount > 3) {
        return Alert.alert('Maximum 3 primary roles allowed');
      }
      if (
        selectedSecondary.length === 0 &&
        savedCustomSecondaryRoles.length === 0
      ) {
        return Alert.alert('Select at least 1 secondary role');
      }

      // ✅ PRIMARY PAYLOAD
      const primaryPayload = {
        roles: selectedPrimary,
        other_roles: savedCustomPrimaryRoles.map(role => ({
          name: role.trim(),
        })),
      };

      // ✅ SECONDARY PAYLOAD
      const secondaryPayload = {
        roles: selectedSecondary,
        other_roles: savedCustomSecondaryRoles.map(role => ({
          name: role.trim(),
        })),
      };

      console.log('PRIMARY PAYLOAD', primaryPayload);

      console.log('SECONDARY PAYLOAD', secondaryPayload);

      // ✅ UPDATE PRIMARY
      await Promise.all([
        dispatch(updatePrimaryRoles(primaryPayload)).unwrap(),
        dispatch(updateSecondaryRoles(secondaryPayload)).unwrap(),
      ]);

      await dispatch(getUserProfile(profileUser?.user_name)).unwrap();

      show({
        type: 'success',
        title: 'Roles updated successfully!',
      });

      navigation.goBack();
    } catch (error: any) {
      console.log('ROLE SAVE ERROR', error);

      show({
        type: 'error',
        title: error,
      });
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
        },
      ]}
      edges={['top', 'left', 'right']}
    >
      <AuthHeader title="Edit Roles" showBack onBack={handleBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        {/* PRIMARY */}
        <Text
          style={[
            styles.title,
            {
              color: textColor,
            },
          ]}
        >
          Primary Roles
        </Text>
        <Text style={{fontFamily:Fonts.Regular, color:themeColors.gray, fontSize:13}}>Select exactly 3 primary roles (3/3 selected)</Text>

        <View style={styles.chipsContainer}>
          {loading
            ? Array.from({
              length: 8,
            }).map((_, i) => <SkeletonChip key={i} />)
            : Array.isArray(primaryRoles) &&
            primaryRoles.map((item: any) => {
              const roleId = item?.id || item?.role_id;

              return (
                <Chip
                  key={roleId}
                  item={{
                    label: item.display_name,
                  }}
                  selected={selectedPrimary.includes(roleId)}
                  onPress={() => togglePrimary(roleId)}
                />
              );
            })}

          {/* CUSTOM PRIMARY CHIP */}
          {savedCustomPrimaryRoles.map(role => (
            <Chip
              key={role}
              item={{
                label: role,
              }}
              selected
              onPress={() =>
                setSavedCustomPrimaryRoles(prev =>
                  prev.filter(item => item !== role),
                )
              }
            />
          ))}
          {/* INLINE CUSTOM INPUT */}
          {showCustomPrimaryInput ? (
            <View style={styles.customRoleRow}>
              <TextInput
                placeholder="Add custom role"
                placeholderTextColor="#777"
                value={customPrimaryRole}
                onChangeText={setCustomPrimaryRole}
                style={styles.customRoleInput}
                autoFocus
              />

              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => {
                  const trimmed = customPrimaryRole.trim();

                  if (!trimmed) return;

                  const alreadyExists = savedCustomPrimaryRoles.some(
                    role => role.toLowerCase() === trimmed.toLowerCase(),
                  );

                  if (alreadyExists) {
                    show({
                      type: 'info',
                      title: 'Role already added',
                    });
                    return;
                  }

                  const total = selectedPrimary.length + savedCustomPrimaryRoles.length;

                  if (total >= 3) {
                    show({
                      type: 'info',
                      title: 'Maximum 3 primary roles allowed',
                    });
                    return;
                  }

                  setSavedCustomPrimaryRoles(prev => [...prev, trimmed]);

                  setCustomPrimaryRole('');
                  setShowCustomPrimaryInput(false);
                }}
              >
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.addCustomChip}
              onPress={() => setShowCustomPrimaryInput(true)}
            >
              <Text style={styles.addCustomChipText}>+ Add custom role</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* SECONDARY */}
        <Text
          style={[
            styles.title,
            {
              color: textColor,
              marginTop: 20,
            },
          ]}
        >
          Secondary Roles
        </Text>
        <Text style={{fontFamily:Fonts.Regular, color:themeColors.gray, fontSize:13}}>Select any number of secondary roles (5 selected)</Text>

        <View style={styles.chipsContainer}>
          {loading
            ? Array.from({
              length: 8,
            }).map((_, i) => <SkeletonChip key={i} />)
            : Array.isArray(secondaryRoles) &&
            secondaryRoles.map((item: any) => {
              const roleId = item?.id || item?.role_id;

              return (
                <Chip
                  key={roleId}
                  item={{
                    label: item?.display_name,
                  }}
                  selected={selectedSecondary.includes(roleId)}
                  onPress={() => toggleSecondary(roleId)}
                />
              );
            })}

          {/* CUSTOM SECONDARY CHIP */}
          {savedCustomSecondaryRoles.map(role => (
            <Chip
              key={role}
              item={{
                label: role,
              }}
              selected
              onPress={() =>
                setSavedCustomSecondaryRoles(prev =>
                  prev.filter(item => item !== role),
                )
              }
            />
          ))}

          {/* INLINE CUSTOM INPUT */}
          {showCustomSecondaryInput ? (
            <View style={styles.customRoleRow}>
              <TextInput
                placeholder="Add custom role"
                placeholderTextColor="#777"
                value={customSecondaryRole}
                onChangeText={setCustomSecondaryRole}
                style={styles.customRoleInput}
                autoFocus
              />

              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => {
                  const trimmed = customSecondaryRole.trim();

                  if (!trimmed) return;

                  const alreadyExists = savedCustomSecondaryRoles.some(
                    role => role.toLowerCase() === trimmed.toLowerCase(),
                  );

                  if (alreadyExists) {
                    show({
                      type: 'info',
                      title: 'Role already added',
                    });
                    return;
                  }

                  setSavedCustomSecondaryRoles(prev => [...prev, trimmed]);

                  setCustomSecondaryRole('');
                  setShowCustomSecondaryInput(false);
                }}
              >
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.addCustomChip}
              onPress={() => setShowCustomSecondaryInput(true)}
            >
              <Text style={styles.addCustomChipText}>+ Add custom role</Text>
            </TouchableOpacity>
          )}
        </View>

        <PrimaryButton
          title={loading ? 'Saving...' : 'Save'}
          onPress={handleSave}
          disabled={loading}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default RoleEditScreen;

/* ---------------- SKELETON ---------------- */

const SkeletonChip = () => {
  const shimmer = useRef(new Animated.Value(0)).current;

  const isDark = true;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 200],
  });

  return (
    <View
      style={[
        styles.skeletonChip,
        {
          backgroundColor: isDark ? '#2A2A2A' : '#E0E0E0',
        },
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],

            backgroundColor: isDark
              ? 'rgba(255,255,255,0.1)'
              : 'rgba(255,255,255,0.6)',
          },
        ]}
      />
    </View>
  );
};

/* ---------------- CHIP ---------------- */

const Chip = ({
  item,
  selected,
  onPress,
}: {
  item: any;
  selected: boolean;
  onPress: () => void;
}) => {
  const isDark = true;

  const textColor = isDark ? themeColors.white : themeColors.black;

  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale }],
      }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        style={[
          styles.chip,
          {
            backgroundColor: selected
              ? themeColors.primary
              : isDark
                ? themeColors.card
                : '#F4F4F4',
          },
        ]}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
      >
        <Text
          style={[
            styles.chipText,
            {
              color: selected ? '#fff' : textColor,
            },
          ]}
        >
          {item.emoji} {item.label}
        </Text>

        <Feather
          name={selected ? 'x' : 'plus'}
          size={16}
          color={selected ? '#fff' : themeColors.primary}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },

  title: {
    fontSize: 18,
    fontFamily: Fonts.Medium,
    marginTop: 10,
  },

  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 3,
    paddingHorizontal: 14,
    borderRadius: 20,
  },

  chipText: {
    fontSize: 14,
    fontFamily: Fonts.Medium,
  },

  skeletonChip: {
    width: 100,
    height: 36,
    borderRadius: 20,
    overflow: 'hidden',
  },

  shimmer: {
    width: 80,
    height: '100%',
    position: 'absolute',
  },

  customRoleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    width: '100%',
  },

  customRoleInput: {
    flex: 1,
    height: 40,
    borderRadius: 24,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 18,
    color: '#fff',
    fontFamily: Fonts.Medium,
  },

  addBtn: {
    height: 40,
    paddingHorizontal: 22,
    borderRadius: 24,
    backgroundColor: themeColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  addBtnText: {
    color: '#000',
    fontFamily: Fonts.Bold,
    fontSize: 15,
  },

  addCustomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: themeColors.card,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    // marginTop: 4,
  },

  addCustomChipText: {
    color: themeColors.white,
    fontSize: 14,
    fontFamily: Fonts.Medium,
  },
});
