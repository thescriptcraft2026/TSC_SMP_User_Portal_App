import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AuthHeader from '../../components/Header/AuthHeader';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import {
  updateBio,
  getUserThunk,
} from '../../redux/slices/authSlice';
import { useToast } from '../../components/Toast/ToastProvider';
import FloatingInputTwo from '../../components/Input/FloatingInputTwo';
import { reset } from '../../../navigationRef';

const BioSetupScreen = ({ navigation, route }: any) => {
  const { show } = useToast();
  const dispatch = useDispatch<any>();
  const insets = useSafeAreaInsets();

  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const textColor = themeColors.white;
  const bgColor = themeColors.black;

  const { user } = useSelector((state: any) => state.auth);

  useEffect(() => {
    if (user?.bio) {
      setBio(user.bio);
    }
  }, [user]);

  const animateStep = () => {
    slideAnim.setValue(50);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const handleNext = async () => {
    try {
      setLoading(true);

      const trimmedBio = bio.trim();

      if (trimmedBio.length > 0 && trimmedBio.length < 50) {
        Alert.alert('Bio must be at least 50 characters');
        return;
      }

      if (trimmedBio.length > 500) {
        Alert.alert('Bio must not exceed 500 characters');
        return;
      }

      await dispatch(
        updateBio({
          bio: trimmedBio,
        }),
      ).unwrap();

      await AsyncStorage.setItem('bio_setup_completed', 'true');

      await dispatch(getUserThunk()).unwrap();

      reset('App', {
        screen: 'BottomTab',
        params: { screen: 'Feed' },
      });
    } catch (error: any) {
      show({
        type: 'error',
        title:error
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('bio_setup_completed', 'true');
    await dispatch(getUserThunk()).unwrap();
    reset('App', {
      screen: 'BottomTab',
      params: { screen: 'Feed' },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar translucent={false} barStyle={'light-content'} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} // Remove 'height' for Android
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 2}
        enabled={Platform.OS === 'ios'} // Only enable for iOS
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <View style={styles.innerContainer}>
              <AuthHeader title="Profile Setup" showBack={false} />

              {/* Progress */}
              <View style={styles.stepContainer}>
                {[1, 2, 3].map(item => {
                  const active = 1 >= item;

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
                                1 > item ? themeColors.primary : '#ccc',
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
                    label="Bio"
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
                    onPress={handleSkip}
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
              </Animated.View>
            </View>

            <View style={{ paddingBottom: insets.bottom + 12 }}>
              <PrimaryButton
                title={loading ? 'Submiting...' : 'Submit'}
                disabled={loading}
                onPress={handleNext}
                loading={loading}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default BioSetupScreen;

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
  },
  subTitle: {
    fontFamily: Fonts.Regular,
    fontSize: 16,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
});
