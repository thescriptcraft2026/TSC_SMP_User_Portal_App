import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  useColorScheme,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

import AuthHeader from '../../components/Header/AuthHeader';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import { useDispatch, useSelector } from 'react-redux';
import {
  getPrimaryRoles,
  getUserThunk,
  getSecondaryRoles,
  updateBio,
  updatePrimaryRoles,
  updateSecondaryRoles,
} from '../../redux/slices/authSlice';
import { useToast } from '../../components/Toast/ToastProvider';
import FloatingInputTwo from '../../components/Input/FloatingInputTwo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reset } from '../../../navigationRef';

const ChooseInterests = ({ navigation, route }: any) => {
  const initialStep = route?.params?.step;
  const { show } = useToast();

  const [step, setStep] = useState(1);
  const [bio, setBio] = useState('');

  const [customPrimaryRole, setCustomPrimaryRole] = useState('');
  const [customSecondaryRole, setCustomSecondaryRole] = useState('');

  const [selectedPrimary, setSelectedPrimary] = useState<number[]>([]);
  const [selectedSecondary, setSelectedSecondary] = useState<number[]>([]);

  const [showCustomPrimaryInput, setShowCustomPrimaryInput] = useState(false);
  const [showCustomSecondaryInput, setShowCustomSecondaryInput] =
    useState(false);

  const [savedCustomPrimaryRoles, setSavedCustomPrimaryRoles] = useState<
    string[]
  >([]);

  const [savedCustomSecondaryRoles, setSavedCustomSecondaryRoles] = useState<
    string[]
  >([]);

  const slideAnim = useRef(new Animated.Value(0)).current;

  const textColor = themeColors.white;
  const bgColor = themeColors.black;

  const dispatch = useDispatch<any>();

  const {
    primaryRoles,
    suggestedPrimary,
    secondaryRoles,
    suggestedSecondary,
    loading,
    user,
    bio: savedBio,
  } = useSelector((state: any) => state.auth);

  const animateStep = () => {
    slideAnim.setValue(50);

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (suggestedPrimary?.length) {
      setSelectedPrimary(suggestedPrimary.map((item: any) => item.id));
    }
  }, [suggestedPrimary]);

  useEffect(() => {
    if (suggestedSecondary?.length) {
      setSelectedSecondary(suggestedSecondary.map((item: any) => item.id));
    }
  }, [suggestedSecondary]);

  useEffect(() => {
    if (user?.bio) {
      setBio(user.bio);
    }
  }, [user]);

  useEffect(() => {
    if (!step) return;

    const fetchData = async () => {
      try {
        if (step === 2 && primaryRoles.length === 0) {
          await dispatch(getPrimaryRoles());
        }

        if (step === 3 && secondaryRoles.length === 0) {
          await dispatch(getSecondaryRoles());
        }
      } catch (err) {
        console.log('INIT FETCH ERROR:', err);
      }
    };

    fetchData();
  }, [step]);

  useEffect(() => {
    if (!user?.roles?.length) {
      return;
    }

    const primaryIds = user.roles
      .filter((role: any) => role?.UserRole?.isPrimary)
      .map((role: any) => role.id);

    const secondaryIds = user.roles
      .filter((role: any) => !role?.UserRole?.isPrimary)
      .map((role: any) => role.id);

    setSelectedPrimary(primaryIds);
    setSelectedSecondary(secondaryIds);
  }, [user]);

  const togglePrimary = (id: number) => {
    const customCount = savedCustomPrimaryRoles.length;

    if (selectedPrimary.includes(id)) {
      setSelectedPrimary(prev => prev.filter(i => i !== id));
      return;
    }

    const totalCount = selectedPrimary.length + customCount;

    if (totalCount >= 3) {
      show({
        type: 'info',
        title: 'Maximum 3 primary roles allowed',
      });
      return;
    }

    setSelectedPrimary(prev => [...prev, id]);
  };

  const addCustomPrimaryRole = () => {
    const trimmed = customPrimaryRole.trim();

    if (!trimmed) {
      return;
    }

    // Already exists in predefined roles
    const existsInPrimary = primaryRoles.some(
      (item: any) =>
        item.display_name.trim().toLowerCase() ===
        trimmed.toLowerCase(),
    );

    if (existsInPrimary) {
      show({
        type: 'info',
        title: 'This role already exists. Please select it from the list.',
      });
      return;
    }

    // Already exists in custom roles
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

    const total =
      selectedPrimary.length + savedCustomPrimaryRoles.length;

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
  };

  const addCustomSecondaryRole = () => {
    const trimmed = customSecondaryRole.trim();

    if (!trimmed) {
      return;
    }

    // Already exists in predefined roles
    const existsInSecondary = secondaryRoles.some(
      (item: any) =>
        item.display_name.trim().toLowerCase() ===
        trimmed.toLowerCase(),
    );

    if (existsInSecondary) {
      show({
        type: 'info',
        title: 'This role already exists. Please select it from the list.',
      });
      return;
    }

    // Already exists in custom roles
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
  };

  const removeCustomPrimaryRole = (role: string) => {
    setSavedCustomPrimaryRoles(prev =>
      prev.filter(item => item !== role),
    );
  };

  const removeCustomSecondaryRole = (role: string) => {
    setSavedCustomSecondaryRoles(prev =>
      prev.filter(item => item !== role),
    );
  };

  const toggleSecondary = (id: number) => {
    if (selectedSecondary.includes(id)) {
      setSelectedSecondary(prev => prev.filter(i => i !== id));
    } else {
      setSelectedSecondary(prev => [...prev, id]);
    }
  };

  const prevStep = () => {
    if (step === 1) {
      return;
    }

    setStep(prev => prev - 1);

    animateStep();
  };

  const nextStep = async () => {
    try {
      // STEP 1 → BIO
      if (step === 1) {
        const trimmedBio = bio.trim();

        if (trimmedBio.length > 0 && trimmedBio.length < 50) {
          return Alert.alert('Bio must be at least 50 characters');
        }

        if (trimmedBio.length > 500) {
          return Alert.alert('Bio must not exceed 500 characters');
        }

        if (trimmedBio.length > 0) {
          await dispatch(updateBio({ bio: trimmedBio })).unwrap();
        }

        await AsyncStorage.setItem('bio_setup_completed', 'true');

        await dispatch(getUserThunk()).unwrap();
        await dispatch(getPrimaryRoles());

        setStep(2);
        animateStep();
        return;
      }

      // STEP 2 → PRIMARY ROLES
      if (step === 2) {
        if (
          selectedPrimary.length === 0 &&
          savedCustomPrimaryRoles.length === 0
        ) {
          return Alert.alert('Select at least 1 primary role');
        }

        await dispatch(
          updatePrimaryRoles({
            roles: selectedPrimary,
            other_roles: savedCustomPrimaryRoles.map(role => ({
              name: role,
            })),
          }),
        ).unwrap();

        await dispatch(getUserThunk()).unwrap();
        await dispatch(getSecondaryRoles());

        show({
          type: 'success',
          title: 'Primary roles updated!',
        });

        setStep(3);
        animateStep();
        return;
      }

      // STEP 3 → SECONDARY ROLES
      if (step === 3) {
        if (
          selectedSecondary.length > 0 ||
          savedCustomSecondaryRoles.length > 0
        ) {
          await dispatch(
            updateSecondaryRoles({
              roles: selectedSecondary,
              other_roles: savedCustomSecondaryRoles.map(role => ({
                name: role,
              })),
            }),
          ).unwrap();
        }

        await dispatch(getUserThunk()).unwrap();

        show({
          type: 'success',
          title: 'Setup complete!',
        });

        reset('App');
        return;
      }
    } catch (error: any) {
      console.log('ERROR:', error);

      show({
        type: 'error',
        title:
          error?.response?.data?.message ||
          error?.message ||
          'Something went wrong',
      });
    }
  };

  useEffect(() => {
    console.log('Mounted');
    return () => console.log('Unmounted');
  }, []);

  useEffect(() => {
    if (initialStep) {
      setStep(initialStep);
      return;
    }

    if (!user) return;

    if (user?.bio) {
      setBio(user.bio);
    }

    if (!user?.added_primary_roles) {
      if (!user?.bio?.trim()) {
        setStep(1);
      } else {
        setStep(2);
      }
      return;
    }

    if (!user?.added_secondary_roles) {
      setStep(3);
      return;
    }

    navigation.navigate('App');
  }, [initialStep, user]);


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar translucent={false} barStyle={'light-content'} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <View style={styles.innerContainer}>
              <AuthHeader
                title="Profile Setup"
                showBack={step > 1}
                onBack={prevStep}
              />

              {/* Progress */}
              <View style={styles.stepContainer}>
                {[1, 2, 3].map(item => {
                  const active = step >= item;

                  return (
                    <View key={item} style={styles.stepWrapper}>
                      <View
                        style={[
                          styles.stepCircle,
                          {
                            backgroundColor: active
                              ? themeColors.primary
                              : 'transparent',
                            borderColor: active ? themeColors.primary : '#ccc',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.stepText,
                            { color: active ? '#fff' : '#999' },
                          ]}
                        >
                          {item}
                        </Text>
                      </View>

                      {item !== 3 && (
                        <View
                          style={[
                            styles.stepLine,
                            {
                              backgroundColor:
                                step > item ? themeColors.primary : '#ccc',
                            },
                          ]}
                        />
                      )}
                    </View>
                  );
                })}
              </View>

              <Animated.View
                style={{
                  flex: 1,
                  transform: [{ translateX: slideAnim }],
                }}
              >
                {/* STEP 1 */}
                {step === 1 && (
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingBottom: 120 }}
                  >
                    <Text style={[styles.title, { color: textColor }]}>
                      Tell your story
                    </Text>

                    <Text style={[styles.subTitle, { color: textColor }]}>
                      Every great creator starts somewhere. Tell us your
                      journey—and what keeps your passion alive.
                    </Text>

                    <View style={{ marginBottom: 12 }} />

                    <FloatingInputTwo
                      label=""
                      multiline
                      value={bio}
                      onChangeText={setBio}
                      height={250}
                      maxLength={500}
                    />

                    <Text
                      style={{
                        alignSelf: 'flex-end',
                        color: '#888',
                        marginTop: -10,
                      }}
                    >
                      {bio.length}/500 • Minimum 100 characters
                    </Text>

                    <TouchableOpacity
                      onPress={async () => {
                        await AsyncStorage.setItem(
                          'bio_setup_completed',
                          'true',
                        );

                        setStep(2);

                        animateStep();
                      }}
                      style={{
                        alignSelf: 'flex-end',
                        marginTop: 15,
                      }}
                    >
                      <Text
                        style={{
                          color: themeColors.primary,
                          fontFamily: Fonts.Bold,
                          fontSize: 14,
                        }}
                      >
                        Skip
                      </Text>
                    </TouchableOpacity>
                  </ScrollView>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.chipsContainer}
                  >
                    <Text style={[styles.title, { color: textColor }]}>
                      Your creative primary roles
                    </Text>

                    <Text style={[styles.subTitle, { color: textColor }]}>
                      How do you contribute to cinema? Select your primary roles
                      and optionally your secondary specializations.
                    </Text>

                    {loading
                      ? Array.from({ length: 8 }).map((_, i) => (
                        <SkeletonChip key={i} />
                      ))
                      : primaryRoles.map((item: any) => (
                        <Chip
                          key={item.id}
                          item={{
                            label: item.display_name,
                          }}
                          selected={selectedPrimary.includes(item.id)}
                          onPress={() => togglePrimary(item.id)}
                        />
                      ))}

                    {savedCustomPrimaryRoles.map(role => (
                      <Chip
                        key={role}
                        item={{
                          label: role,
                        }}
                        selected={true}
                        onPress={() => removeCustomPrimaryRole(role)}
                      />
                    ))}

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
                          onPress={addCustomPrimaryRole}
                        >
                          <Text style={styles.addBtnText}>Add</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      selectedPrimary.length + savedCustomPrimaryRoles.length < 3 && (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={styles.addCustomChip}
                          onPress={() => setShowCustomPrimaryInput(true)}
                        >
                          <Text style={styles.addCustomChipText}>
                            + Add custom role
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </ScrollView>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <>
                    <Text style={[styles.title, { color: textColor }]}>
                      Select Secondary Roles
                    </Text>

                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={styles.chipsContainer}
                    >
                      {loading
                        ? Array.from({ length: 8 }).map((_, i) => (
                          <SkeletonChip key={i} />
                        ))
                        : secondaryRoles.map((item: any) => (
                          <Chip
                            key={item.id}
                            item={{
                              label: item.display_name,
                            }}
                            selected={selectedSecondary.includes(item.id)}
                            onPress={() => toggleSecondary(item.id)}
                          />
                        ))}

                      {savedCustomSecondaryRoles.map(role => (
                        <Chip
                          key={role}
                          item={{
                            label: role,
                          }}
                          selected
                          onPress={() => removeCustomSecondaryRole(role)}
                        />
                      ))}

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
                            onPress={addCustomSecondaryRole}
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
                          <Text style={styles.addCustomChipText}>
                            + Add custom role
                          </Text>
                        </TouchableOpacity>
                      )}
                    </ScrollView>
                  </>
                )}
              </Animated.View>
            </View>

            <View>
              <PrimaryButton
                title={
                  loading ? 'Saving...' : step === 3 ? 'Finish' : 'Continue'
                }
                disabled={loading}
                onPress={nextStep}
                loading={loading}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChooseInterests;

const SkeletonChip = () => {
  const shimmer = useRef(new Animated.Value(0)).current;
  const isDark = useColorScheme() === 'dark';

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
    <View style={[styles.skeletonChip, { backgroundColor: '#2A2A2A' }]}>
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
            backgroundColor: 'rgba(255,255,255,0.1)',
          },
        ]}
      />
    </View>
  );
};

const Chip = ({
  item,
  selected,
  onPress,
}: {
  item: any;
  selected: boolean;
  onPress: () => void;
}) => {
  const isDark = useColorScheme() === 'dark';
  const textColor = themeColors.white;
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
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={[
          styles.chip,
          {
            backgroundColor: selected ? themeColors.primary : themeColors.card,
          },
        ]}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
      >
        <Text
          style={[styles.chipText, { color: selected ? '#fff' : textColor }]}
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

  innerContainer: {
    flex: 1,
  },

  title: {
    fontSize: 20,
    fontFamily: Fonts.Bold,
    // textAlign: 'center',
  },

  subTitle: {
    fontFamily: Fonts.Regular,
    fontSize: 16,
    // textAlign: 'center',
    // marginBottom: 12,
  },

  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // marginVertical: 10,
    marginBottom: 15,
  },

  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 20,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },

  stepText: {
    fontSize: 14,
    fontWeight: '600',
  },

  stepLine: {
    width: 50,
    height: 2,
  },

  bioInput: {
    borderRadius: 10,
    padding: 12,
    height: 150,
    marginTop: 5,
    textAlignVertical: 'top',
    borderWidth: 0.6,
    borderColor: '#ccc',
  },

  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    // marginTop: 20,
    paddingBottom: 100,
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
