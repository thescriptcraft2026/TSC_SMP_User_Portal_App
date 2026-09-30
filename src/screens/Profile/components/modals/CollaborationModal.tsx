import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Pressable,
  useColorScheme,
  Platform,
  StatusBar,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { themeColors } from '../../../../theme/colors';
import Reject from '../../../../assets/SVG/Reject';
import PrimaryButton from '../../../../components/Buttons/PrimaryButton';
import { Fonts } from '../../../../constants/Fonts';
import FloatingInputTwo from '../../../../components/Input/FloatingInputTwo';
import { Controller, useForm } from 'react-hook-form';
import Bag from '../../../../assets/SVG/Bag';
import UserPlus from '../../../../assets/SVG/UserPlus';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (data: FormValues) => void;
  roles?: any[];
  defaultValues?: Partial<FormValues>;
  isAdd?: boolean;
};

type FormValues = {
  publish: boolean;
  type: 'WORK' | 'HIRING' | null;
  roles: any[];
};

const CollaborationModal = ({
  visible,
  onClose,
  onSubmit,
  roles,
  defaultValues,
  isAdd = false,
}: Props) => {
  const isDark = true;
  const insets = useSafeAreaInsets();

  const slideAnim = useRef(new Animated.Value(350)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ✅ Track previous visible state so we only reset on the open transition,
  // not on every re-render that happens to create a new defaultValues object.
  const prevVisibleRef = useRef(false);

  const { handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: {
      publish: false,
      type: null,
      roles: [],
    },
  });

  // ✅ FIX: only reset when the modal transitions from closed -> open.
  useEffect(() => {
    const justOpened = visible && !prevVisibleRef.current;
    prevVisibleRef.current = visible;

    if (!justOpened) return;

    reset({
      publish: defaultValues?.publish ?? false,
      type:
        defaultValues?.type === 'WORK'
          ? 'WORK'
          : defaultValues?.type === 'HIRING'
            ? 'HIRING'
            : null,
      roles: defaultValues?.roles ?? [],
    });

    slideAnim.setValue(350);
    fadeAnim.setValue(0);

    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 18,
        stiffness: 180,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
    // 👇 IMPORTANT: defaultValues intentionally removed from deps.
    // We only want this to fire on the open transition (visible true),
    // not whenever the parent re-renders and creates a new defaultValues reference.
  }, [visible]);

  const cardBg = themeColors.card2;
  const bgColor = themeColors.background;
  const textColor = themeColors.white;

  const selectedType = watch('type');
  const selectedRoles = watch('roles');

  const toggleRole = (id: any) => {
    const roleId = Number(id);

    const current = selectedRoles || [];

    const updated = current.includes(roleId)
      ? current.filter(r => r !== roleId)
      : [...current, roleId];

    setValue('roles', updated, { shouldValidate: true });
  };

  const onSubmitForm = (data: FormValues) => {
    onSubmit?.(data);
  };

  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      statusBarTranslucent
    >
      <StatusBar hidden translucent backgroundColor="transparent" />

      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            marginBottom: Platform.OS === 'ios' ? 10 : 5 + insets.bottom,
            backgroundColor: bgColor,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Pressable onPress={e => e.stopPropagation()}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>
              {isAdd ? "Add Collaboration" : "Edit Collaboration"}
            </Text>

            <TouchableOpacity onPress={onClose}>
              <Reject size={22} color={textColor} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label]}>
            Work status
          </Text>

          {/* WORK */}
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <View style={styles.publishRow}>
              <View style={styles.rowLeft}>
                <Bag size={20} color={textColor} />
                <View>
                  <Text style={[styles.publishTitle, { color: textColor }]}>
                    Available for work
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: Fonts.Regular,
                      color: textColor,
                    }}
                  >
                    Let others know you're open to opportunities
                  </Text>
                </View>
              </View>

              <Switch
                value={selectedType === 'WORK'}
                onValueChange={val => {
                  if (val) {
                    setValue('publish', true, { shouldDirty: true });
                    setValue('type', 'WORK', { shouldDirty: true });
                  } else {
                    setValue('publish', false, { shouldDirty: true });
                    setValue('type', null, { shouldDirty: true });
                    setValue('roles', [], { shouldDirty: true });
                  }
                }}
                trackColor={{ false: '#ccc', true: themeColors.primary }}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                thumbColor={
                  Platform.OS === 'android' ? themeColors.primary : '#f4f3f4'
                }
              />
            </View>
          </View>

          {/* HIRING */}
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <View style={styles.publishRow}>
              <View style={styles.rowLeft}>
                <UserPlus size={22} color={textColor} />
                <View>
                  <Text style={[styles.publishTitle, { color: textColor }]}>
                    Looking to hire
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: Fonts.Regular,
                      color: textColor,
                    }}
                  >
                    Signal you're searching for collaborators
                  </Text>
                </View>
              </View>

              <Switch
                value={selectedType === 'HIRING'}
                onValueChange={val => {
                  if (val) {
                    setValue('publish', true, { shouldDirty: true });
                    setValue('type', 'HIRING', { shouldDirty: true });
                  } else {
                    setValue('publish', false, { shouldDirty: true });
                    setValue('type', null, { shouldDirty: true });
                    setValue('roles', [], { shouldDirty: true });
                  }
                }}
                trackColor={{ false: '#ccc', true: themeColors.primary }}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                thumbColor={
                  Platform.OS === 'android' ? themeColors.primary : '#f4f3f4'
                }
              />
            </View>
          </View>

          {watch('publish') &&
            (selectedType === 'WORK' || selectedType === 'HIRING') && (
              <>
                {/* ROLES */}
                <View style={{ marginBottom: 10 }}>
                  <Text style={[styles.label]}>
                    Roles (select all that apply)
                  </Text>

                  <View
                    style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}
                  >
                    {roles?.map((role: any) => {
                      const isSelected = selectedRoles?.includes(
                        Number(role?.id),
                      );
                      return (
                        <TouchableOpacity
                          key={role?.id}
                          onPress={() => toggleRole(role?.id)}
                          style={[
                            styles.chips,
                            {
                              backgroundColor: isSelected
                                ? themeColors.primary
                                : isDark
                                  ? '#222'
                                  : '#f2f2f2',
                              borderWidth: isSelected ? 0 : 0,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              {
                                color: isSelected
                                  ? themeColors.white
                                  : textColor,
                              },
                            ]}
                          >
                            {role?.display_name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </>
            )}

          {/* Buttons */}
          <PrimaryButton
            title="Save"
            disabled={
              watch('publish') && (!selectedType || selectedRoles.length === 0)
            }
            onPress={handleSubmit(onSubmitForm)}
          />
        </Pressable>
      </Animated.View>
    </Modal>
  );
};

export default CollaborationModal;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },

  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 10,
    right: 10,
    borderBottomLeftRadius: Platform.OS === 'ios' ? 50 : 20,
    borderBottomRightRadius: Platform.OS === 'ios' ? 50 : 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
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
    marginTop: 0,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  title: {
    fontSize: 18,
    fontFamily: Fonts.Bold,
  },

  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 10,
  },

  message: {
    fontSize: 14,
    marginBottom: 20,
    fontFamily: Fonts.Regular,
  },

  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  cancelBtn: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },

  cancelText: {
    fontSize: 14,
    fontFamily: Fonts.Medium,
  },

  label: {
    fontFamily: Fonts.Bold,
    marginBottom: 6,
    color:themeColors.gray
  },

  chips: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 0.2,
  },
  chipText: {
    fontFamily: Fonts.Medium,
    fontSize: 12,
  },

  card: {
    marginBottom: 12,
    padding: 10,
    borderRadius: 12,
  },
  publishRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLeft: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },

  publishTitle: {
    fontSize: 15,
    fontFamily: Fonts.Bold,
  },

  publishSubtitle: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
});