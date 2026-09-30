import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Pressable,
  useColorScheme,
  Easing,
  Keyboard,
  Platform,
  ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';

import { themeColors } from '../../theme/colors';
import Reject from '../../assets/SVG/Reject';
import { Fonts } from '../../constants/Fonts';
import PrimaryButton from '../Buttons/PrimaryButton';
import FloatingInputTwo from '../Input/FloatingInputTwo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { ActivityIndicator } from 'react-native-paper';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    reason: string;
    message?: string;
    postId?: string;
  }) => void;
  post?: any;
  reportType?: string; // ✅ add this
};

const ReportModal = ({
  visible,
  onClose,
  onSubmit,
  post,
  reportType,
}: Props) => {
  const isDark = true;
  const { reports, createLoading } = useSelector((state: any) => state.report);

  const { control, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      reason: '',
      message: '',
    },
  });

  const selectedReason = watch('reason');

  // ✅ Animation values (ONLY ONE SYSTEM)
  const slideAnim = useRef(new Animated.Value(350)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const keyboardTranslateY = useRef(new Animated.Value(0)).current;

  // ✅ Keyboard handling
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardWillShow', e => {
      Animated.timing(keyboardTranslateY, {
        toValue: -e.endCoordinates.height + 40,
        duration: e.duration ?? 250,
        useNativeDriver: true,
      }).start();
    });

    const hideSub = Keyboard.addListener('keyboardWillHide', e => {
      Animated.timing(keyboardTranslateY, {
        toValue: 0,
        duration: e.duration ?? 250,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // ✅ Open / Close animation
  useEffect(() => {
    if (visible) {
      reset();
      // 🔥 RESET VALUES BEFORE ANIMATION
      slideAnim.setValue(350);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 18,
          stiffness: 180,
          mass: 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 350,
          duration: 220,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const onSubmitForm = (data: any) => {
    onSubmit({
      ...data,
      postId: post?.id,
    });

    onClose();
  };

  const bgColor = isDark ? themeColors.black : themeColors.white;
  const textColor = isDark ? themeColors.white : themeColors.black;
  const subText = isDark ? '#aaa' : '#555';

  if (!visible) return null;

  const REPORT_TYPE = reportType; // 🔥 dynamic later if needed

  const filteredReports =
    reports?.filter((item: any) =>
      item.reportTypes?.some(
        (type: any) =>
          String(type.name).toUpperCase() === String(REPORT_TYPE).toUpperCase(),
      ),
    ) || [];

  console.log('REPORT TYPE:', REPORT_TYPE);
  console.log('REPORTS:', reports);

  if (!reports || reports.length === 0) {
    return (
      <Modal transparent>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator />
        </View>
      </Modal>
    );
  }

  return (
    <SafeAreaView edges={['left', 'right']}>
      <Modal transparent animationType="none">
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable
            style={{ flex: 1 }}
            onPress={() => {
              Keyboard.dismiss(); // optional
              reset(); // ✅ reset form
              onClose(); // ✅ close modal
            }}
          />
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: bgColor,
              transform: [
                {
                  translateY: Animated.add(slideAnim, keyboardTranslateY),
                },
              ],
            },
          ]}
        >
          <Pressable
            onPress={e => {
              e.stopPropagation(); // ✅ prevent modal close
              Keyboard.dismiss(); // ✅ only dismiss keyboard
            }}
          >
            {/* Handle */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: textColor }]}>
                  What are you reporting?
                </Text>

                <Text style={[styles.subTitle, { color: subText }]}>
                  Please choose the category that best describes your issue.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                activeOpacity={0.6}
              >
                <Reject size={22} color={textColor} />
              </TouchableOpacity>
            </View>

            {/* Reasons */}
            <Controller
              control={control}
              name="reason"
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <ScrollView
                  style={{ maxHeight: 250 }}
                  showsVerticalScrollIndicator={false}
                >
                  {filteredReports?.map((item: any) => {
                    const isSelected = value === item.id;

                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.reasonItem,
                          isSelected && styles.selectedItem,
                        ]}
                        onPress={() => onChange(item.id)}
                      >
                        <View style={styles.row}>
                          <View
                            style={[
                              styles.radioOuter,
                              { borderColor: themeColors.primary },
                            ]}
                          >
                            {isSelected && <View style={styles.radioInner} />}
                          </View>
                          <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text
                              style={[
                                styles.reasonText,
                                isSelected && styles.reasonTextActive,
                              ]}
                            >
                              {item?.name}
                            </Text>

                            {item?.description ? (
                              <Text style={styles.description}>
                                {item.description}
                              </Text>
                            ) : null}
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            />

            {/* Input */}
            <View style={{ marginTop: 15 }}>
              <Controller
                control={control}
                name="message"
                render={({ field: { onChange, value } }) => (
                  <FloatingInputTwo
                    label="Write Message"
                    value={value}
                    onChangeText={onChange}
                    multiline
                    height={100}
                  />
                )}
              />
            </View>

            {filteredReports.length === 0 && (
              <Text
                style={{
                  color: 'white',
                  textAlign: 'center',
                  marginVertical: 20,
                }}
              >
                No report reasons found
              </Text>
            )}

            {/* Submit */}
            <PrimaryButton
              title="Submit Report"
              onPress={handleSubmit(onSubmitForm)}
              disabled={!selectedReason}
              loading={createLoading}
            />
          </Pressable>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};

export default ReportModal;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },

  sheet: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 13 : 10,
    left: 10,
    right: 10,
    borderBottomLeftRadius: Platform.OS === 'ios' ? 50 : 20,
    borderBottomRightRadius: Platform.OS === 'ios' ? 50 : 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 30,
  },

  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginBottom: 12,
  },

  closeBtn: {
    marginLeft: 0,
    marginTop: -10,
  },

  header: {
    flexDirection: 'row',
    marginBottom: 18,
    alignItems: 'flex-start',
  },

  title: {
    fontSize: 20, // 🔥 bigger
    fontFamily: Fonts.Bold,
  },

  subTitle: {
    fontSize: 13,
    fontFamily: Fonts.Regular,
    marginTop: 4,
    lineHeight: 18,
  },
  postInfo: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: Fonts.Regular,
  },

  reasonItem: {
    paddingVertical: 14,
    borderRadius: 14,
  },

  selectedItem: {
    // backgroundColor: 'rgba(255,193,7,0.15)', // 🔥 highlight
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start', // 🔥 fix alignment
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: themeColors.primary,
  },

  reasonText: {
    fontSize: 14,
    fontFamily: Fonts.SemiBold,
    color: themeColors.white,
  },

  reasonTextActive: {
    color: themeColors.primary,
  },

  description: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    lineHeight: 16,
    fontFamily: Fonts.Regular,
  },
});
