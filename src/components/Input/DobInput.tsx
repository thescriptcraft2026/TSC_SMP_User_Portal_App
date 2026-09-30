import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Animated,
} from 'react-native';

import DatePicker from 'react-native-date-picker';
import Ionicons from '@react-native-vector-icons/ionicons';

import { themeColors } from '../../theme/colors';

type Props = {
  value: Date | null;
  onChange: (date: Date) => void;
};

const DobInput = ({ value, onChange }: Props) => {
  const isDark = true;

  const [open, setOpen] = useState(false);

  const focusAnim = useRef(new Animated.Value(0)).current;

  const inputBg = isDark ? '#1e1e1e' : '#fff';

  const inactiveBorder = isDark ? 'rgba(255,255,255,0.15)' : '#ddd';

  const activeBorder = themeColors.primary as string;

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveBorder, activeBorder],
  });

  const formatDate = (date: Date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();

    return `${d}/${m}/${y}`;
  };

  const handleOpen = () => {
    setOpen(true);

    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleClose = () => {
    setOpen(false);

    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: inputBg,
            borderColor,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.inner}
          onPress={handleOpen}
          activeOpacity={0.8}
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color={isDark ? '#aaa' : '#888'}
            style={{ paddingRight: 10 }}
          />
          <Text
            style={{
              color: value
                ? isDark
                  ? themeColors.white
                  : themeColors.black
                : isDark
                ? '#fff'
                : '#777',
            }}
          >
            {value ? formatDate(value) : 'Date of Birth'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <DatePicker
        modal
        open={open}
        date={value || new Date(2000, 0, 1)}
        mode="date"
        maximumDate={
          new Date(new Date().setFullYear(new Date().getFullYear() - 10))
        }
        minimumDate={new Date(1950, 0, 1)}
        onConfirm={date => {
          handleClose();
          onChange(date);
        }}
        onCancel={handleClose}
      />
    </>
  );
};

export default DobInput;

const styles = StyleSheet.create({
  container: {
    height: 50,
    borderRadius: 30,
    borderWidth: 1,
    marginBottom: 10,
    justifyContent: 'center',
  },

  inner: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
});
