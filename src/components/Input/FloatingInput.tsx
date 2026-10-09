import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Animated,
  TouchableOpacity,
  useColorScheme,
  Text,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';
import Feather from '@react-native-vector-icons/feather';

import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';

type Props = {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  secure?: boolean;
  error?: string;

  // ✅ NEW
  checkUsername?: boolean;
  onUsernameCheck?: (username: string) => Promise<any>;
  style?: any;
  editable?: boolean;
};

const FloatingInput = ({
  label,
  value,
  onChangeText,
  secure,
  error,
  checkUsername,
  onUsernameCheck,
  style,
  editable = true,
}: Props) => {
  const isDark = useColorScheme() === 'dark';
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const focusAnim = useRef(new Animated.Value(0)).current;

  const inputBg = '#1e1e1e';
  const labelBg = '#1e1e1e';

  const inactiveBorder = 'rgba(255,255,255,0.15)';
  const activeBorder = themeColors.primary as string;

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 8,
        duration: 40,
        useNativeDriver: false,
      }),
      Animated.timing(shakeAnim, {
        toValue: -8,
        duration: 40,
        useNativeDriver: false,
      }),
      Animated.timing(shakeAnim, {
        toValue: 6,
        duration: 40,
        useNativeDriver: false,
      }),
      Animated.timing(shakeAnim, {
        toValue: -6,
        duration: 40,
        useNativeDriver: false,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 40,
        useNativeDriver: false,
      }),
    ]).start();
  };

  useEffect(() => {
    if (error) {
      triggerShake();
    }
  }, [error]);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value || focused ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [value, focused]);

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focused]);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveBorder, activeBorder],
  });

  // Determine label color based on floated state
  const isFloated = value || focused;
  const labelColor = isFloated ? themeColors.primary : isDark ? '#aaa' : '#666';

  // ICON SWITCH CASE
  const renderIcon = () => {
    const iconColor = isDark ? '#aaa' : '#888';

    // Change icon color to primary when floated
    const finalIconColor = isFloated ? themeColors.primary : iconColor;

    switch (label.toLowerCase()) {
      case 'email / username':
      case 'email':
        return <Feather name="mail" size={18} color={finalIconColor} />;

      case 'username':
        return <Feather name="user" size={18} color={finalIconColor} />;

      case 'full name':
        return <Feather name="user" size={18} color={finalIconColor} />;

      case 'mobile':
      case 'phone':
        return <Feather name="phone" size={18} color={finalIconColor} />;

      case 'password':
      case 'confirm password':
      case 'new password':
        return <Feather name="lock" size={18} color={finalIconColor} />;

      default:
        return null;
    }
  };

  const labelStyle = {
    position: 'absolute' as const,
    left: 40,
    top: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [14, -9],
    }),
    fontSize: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [15, 12],
    }),
  };

  useEffect(() => {
    if (!checkUsername) return;

    if (!value || value.length < 3) {
      setAvailable(null);
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setChecking(true);

        if (onUsernameCheck) {
          const res = await onUsernameCheck(value);

          setAvailable(res?.data?.available);
          setSuggestions(res?.data?.suggestions || []);
        }
      } catch (err) {
        console.log('username check error', err);
      } finally {
        setChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [value, checkUsername]);

  return (
    <View style={{ marginBottom: 10 }}>
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: inputBg,
            borderColor,
            transform: [{ translateX: shakeAnim }],
          },
          style,
        ]}
      >
        {/* ICON */}
        <View style={styles.icon}>{renderIcon()}</View>

        {/* LABEL */}
        <Animated.Text
          style={[
            labelStyle,
            styles.label,
            {
              backgroundColor: labelBg,
              color: labelColor, // Dynamic color based on floated state
            },
          ]}
        >
          {label}
        </Animated.Text>

        {/* INPUT */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          secureTextEntry={secure && !showPassword}
          style={[
            styles.input,
            { color: themeColors.white },
            !editable && styles.disabledInput,
          ]}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCapitalize="none"
        />

        {/* PASSWORD TOGGLE */}
        {secure && (
          <TouchableOpacity
            style={styles.toggle}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        )}
      </Animated.View>
      {error && (
        <Text
          style={{
            color: '#ff4d4f',
            marginLeft: 10,
            marginTop: 4,
            fontSize: 12,
          }}
        >
          {error}
        </Text>
      )}
      {checkUsername && (
        <>
          {checking && (
            <Text style={{ color: '#999', marginTop: 4 }}>
              Checking username...
            </Text>
          )}

          {available === true && (
            <Text style={{ color: 'green', marginTop: 4 }}>
              Username available
            </Text>
          )}

          {available === false && (
            <Text style={{ color: 'red', marginTop: 4 }}>
              Username not available
            </Text>
          )}

          {suggestions.length > 0 && available === false && (
            <View style={{ marginTop: 6 }}>
              <Text style={{ fontSize: 12, color: '#999' }}>Suggestions:</Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {suggestions.map((item: string, index: number) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => onChangeText(item)}
                    style={{
                      backgroundColor: '#eee',
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 12,
                      marginRight: 6,
                      marginTop: 6,
                    }}
                  >
                    <Text>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default FloatingInput;

const styles = StyleSheet.create({
  container: {
    height: 50,
    borderRadius: 30,
    justifyContent: 'center',
    paddingLeft: 45,
    paddingRight: 22,
    borderWidth: 1,
  },

  icon: {
    position: 'absolute',
    left: 15,
    zIndex: 10,
  },

  label: {
    paddingHorizontal: 6,
    fontFamily:Fonts.Medium
  },

  input: {
    fontSize: 15,
    paddingRight: 50,
    fontFamily:Fonts.Regular
  },

  disabledInput: {
    opacity: 0.72,
  },

  toggle: {
    position: 'absolute',
    right: 15,
  },
});
