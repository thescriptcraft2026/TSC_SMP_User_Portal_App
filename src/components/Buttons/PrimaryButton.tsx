import React, { useRef } from 'react';
import {
  Text,
  StyleSheet,
  Animated,
  Pressable,
  View,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { Fonts } from '../../constants/Fonts';

type Props = {
  title: string;
  icon?: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: any;
  fontSize?: number;

  variant?: 'filled' | 'outline' | 'delete';
  marginTop?: number;
};

const PrimaryButton = ({
  title,
  icon,
  onPress,
  disabled,
  loading,
  style,
  fontSize = 18,
  variant = 'filled',
  marginTop = 20,
}: Props) => {
  const scale = useRef(new Animated.Value(1)).current;

  const isDisabled = disabled || loading;
  const isOutline = variant === 'outline';
  const isDelete = variant === 'delete';

  const pressIn = () => {
    if (isDisabled) return;

    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    if (isDisabled) return;

    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={
            isDelete
              ? '#FF5A60'
              : isOutline
              ? '#F7B733'
              : '#fff'
          }
        />
      );
    }

    return (
      <>
        {icon && <View style={styles.icon}>{icon}</View>}

        <Text
          style={[
            styles.text,
            { fontSize },
            isOutline && styles.outlineText,
            isDelete && styles.deleteText,
          ]}
        >
          {title}
        </Text>
      </>
    );
  };

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      style={style}
    >
      <Animated.View
        style={[
          styles.wrapper,
          { marginTop },
          { transform: [{ scale }] },
          isDisabled && { opacity: 0.6 },
        ]}
      >
        {isDelete ? (
          // 🔴 Delete Button
          <View style={styles.deleteButton}>
            {renderContent()}
          </View>
        ) : isOutline ? (
          // 🟡 Outline Button
          <View style={styles.outlineButton}>
            {renderContent()}
          </View>
        ) : (
          // 🟡 Filled Gradient Button
          <LinearGradient
            colors={['#F7B733', '#EB9D08', '#C57F06']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            {renderContent()}
          </LinearGradient>
        )}
      </Animated.View>
    </Pressable>
  );
};

export default PrimaryButton;

const styles = StyleSheet.create({
  wrapper: {},

  button: {
    height: 40,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    flexDirection: 'row',
  },

  outlineButton: {
    height: 40,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#F7B733',
    backgroundColor: 'transparent',
  },

  // 🔴 DELETE BUTTON
  deleteButton: {
    height: 40,
    borderRadius:30,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#442023',
  },

  icon: {
    marginRight: 6,
  },

  text: {
    color: '#fff',
    fontFamily: Fonts.SemiBold,
  },

  outlineText: {
    color: '#F7B733',
  },

  deleteText: {
    color: '#FF5A60',
  },
});