import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Animated,
  useColorScheme,
  Text,
  NativeSyntheticEvent,
  TextInputContentSizeChangeEventData,
  TouchableOpacity,
  Platform,
} from 'react-native';

import Feather from '@react-native-vector-icons/feather';

import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';

type Props = {
  label: string;
  value: string;
  onChangeText?: (t: string) => void;
  error?: string;
  multiline?: boolean;
  height?: number;
  keyboardType?: any;
  secureTextEntry?: boolean;
  backgroundColor?: any;
  labelBG?: any;
  editable?: boolean;
  maxLength?: number;
  showCharacterCount?: boolean;
  minLength?: number;
  onSubmitEditing?: () => void;
  showBottomText?: boolean;
  bottomText?: string;
  bottomTextStyle?: any;
  enableMentions?: boolean;
};

const FloatingInputTwo = ({
  label,
  value,
  onChangeText,
  error,
  multiline = false,
  height = 42,
  keyboardType,
  secureTextEntry = false,
  backgroundColor,
  labelBG,
  editable = true,
  maxLength,
  showCharacterCount,
  minLength = 0,
  onSubmitEditing,
  showBottomText = false,
  bottomText = '',
  bottomTextStyle,
  enableMentions = false,
}: Props) => {
  const isDark = true;
  const [focused, setFocused] = useState(false);
  const [hidePassword, setHidePassword] = useState(secureTextEntry);

  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const [inputHeight, setInputHeight] = useState(height);

  const inputBg = backgroundColor ?? (isDark ? '#1e1e1e' : '#fff');
  const finalBackgroundColor = backgroundColor ?? inputBg;
  const cardBg = isDark ? '#1c1c1e' : themeColors.slate;
  const labelBg = isDark ? cardBg : themeColors.white;
  const finalLabelBg = labelBG ?? labelBg;

  const inactiveBorder = isDark ? 'rgba(255,255,255,0.15)' : '#ddd';
  const activeBorder = themeColors.primary as string;

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 8,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -8,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 6,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -6,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (error) triggerShake();
  }, [error]);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value || focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, focused]);

  const borderColor = focused ? activeBorder : inactiveBorder;

  // Determine label color based on focused or value state
  const isFloated = value || focused;
  const labelColor = isFloated ? themeColors.primary : isDark ? '#aaa' : '#666';

  const labelStyle = {
    position: 'absolute' as const,
    left: 14,
    top: anim.interpolate({
      inputRange: [0, 1],
      outputRange: multiline ? [22, -10] : [height / 2 - 10, -8],
    }),
    fontSize: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [15, 12],
    }),
  };

  const handleContentSizeChange = (
    e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>,
  ) => {
    if (!multiline) return;

    const newHeight = Math.max(
      height,
      Math.min(e.nativeEvent.contentSize.height + 28, 250),
    );

    setInputHeight(newHeight);
  };

  const renderStyledText = (text: string) => {
    const parts = text.split(/(@\w+)/g);

    return parts.map((part, index) => {
      const isMention = /^@\w+$/.test(part);

      return (
        <Text
          key={index}
          style={{
            color: isMention ? themeColors.primary : themeColors.white,
          }}
        >
          {part}
        </Text>
      );
    });
  };

  return (
    <View style={{ marginBottom: 16 }}>
      <Animated.View
        style={[
          styles.container,
          {
            height: multiline ? undefined : height,
            minHeight: multiline ? inputHeight : height,
            backgroundColor: finalBackgroundColor,
            borderColor,
            justifyContent: multiline ? 'flex-start' : 'center',
            paddingTop: multiline ? (Platform.OS === 'ios' ? 20 : 16) : 12,
            paddingBottom: multiline ? 10 : 0,
            transform: [{ translateX: shakeAnim }],
          },
        ]}
      >
        <Animated.Text
          style={[
            labelStyle,
            styles.label,
            {
              backgroundColor: finalLabelBg,
              color: labelColor, // Dynamic color based on floated state
            },
          ]}
        >
          {label}
        </Animated.Text>

        {/* INPUT + ICON ROW */}
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View style={{ flex: 1, position: 'relative' }}>
            {/* Highlight Layer - only render when enableMentions is true */}
            {enableMentions && value && (
              <Text
                style={[
                  styles.input,
                  {
                    color: themeColors.white,
                    minHeight: multiline ? height : undefined,
                    height: multiline ? undefined : height,

                    marginTop:
                      Platform.OS === 'ios' ? (multiline ? 10 : -10) : 0,

                    paddingTop: multiline
                      ? Platform.OS === 'ios'
                        ? 16
                        : 8
                      : 0,

                    paddingBottom: multiline ? 12 : 0,
                  },
                ]}
              >
                {renderStyledText(value || '')}
              </Text>
            )}

            {/* Real Input */}
            <TextInput
              value={value}
              onChangeText={onChangeText}
              multiline={multiline}
              onContentSizeChange={handleContentSizeChange}
              textAlignVertical="top"
              secureTextEntry={hidePassword}
              style={[
                styles.input,
                {
                  color: themeColors.white,
                  minHeight: multiline ? height : undefined,
                  height: multiline ? undefined : height,
                  paddingTop: Platform.OS === 'android' ? 4 : 0,
                  paddingBottom: multiline ? 8 : 0,
                },
              ]}
              selectionColor={themeColors.primary}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              keyboardType={keyboardType}
              editable={editable}
              maxLength={maxLength}
              autoCapitalize="none"
              scrollEnabled={false}
            />
          </View>

          {/* 👁️ EYE ICON */}
          {secureTextEntry && (
            <TouchableOpacity
              onPress={() => setHidePassword(prev => !prev)}
              style={styles.eyeIcon}
            >
              <Feather
                name={hidePassword ? 'eye-off' : 'eye'}
                size={14}
                color={isDark ? '#aaa' : '#666'}
              />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Character Count */}
      {showCharacterCount && multiline && (
        <Text
          style={{
            fontSize: 12,
            color: '#888',
            marginLeft: 6,
            marginTop: 4,
          }}
        >
          {(value || '').length}
          {minLength ? `/${maxLength}` : ''}
        </Text>
      )}

      {/* Bottom Text */}
      {showBottomText && (
        <Text
          style={[
            {
              alignSelf: 'flex-end',
              color: '#888',
              marginTop: -10,
              fontSize: 12,
            },
            bottomTextStyle,
          ]}
        >
          {bottomText}
        </Text>
      )}

      {/* Error */}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

export default FloatingInputTwo;

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  label: {
    paddingHorizontal: 4,
    fontFamily: Fonts.Medium,
  },
  input: {
    fontSize: 15,
    padding: 0,
    // overflow: 'hidden',
    marginTop: Platform.OS === 'ios' ? -10 : 0,
    fontFamily:Fonts.Regular
  },
  eyeIcon: {
    marginLeft: 8,
    marginTop:-10
  },
  error: {
    color: '#ff4d4f',
    marginLeft: 6,
    marginTop: 4,
    fontSize: 12,
  },
});
