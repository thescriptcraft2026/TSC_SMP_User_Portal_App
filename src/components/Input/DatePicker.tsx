import React, { useEffect, useRef, useState } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Animated,
  View,
} from 'react-native';

import DatePicker from 'react-native-date-picker';
import Ionicons from '@react-native-vector-icons/ionicons';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';

type Props = {
  label: string;
  value: Date | any | null;
  onChange: (date: Date) => void;
  error?: string;
};

const DatePickerr = ({ label, value, onChange, error }: Props) => {
  const isDark = true;
  const [open, setOpen] = useState(false);

  const isFocused = open || !!value;

  const inputBg = isDark ? '#1c1c1e' : '#fff';
  const borderColor =isDark
    ? 'rgba(255,255,255,0.2)'
    : '#ddd';

  const textColor = isDark ? '#fff' : '#000';

  const formatDate = (date: any) => {
    if (!date) return '';

    const parsedDate = new Date(date); // 🔥 FIX

    if (isNaN(parsedDate.getTime())) return ''; // safety check

    const d = parsedDate.getDate().toString().padStart(2, '0');
    const m = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
    const y = parsedDate.getFullYear();

    return `${d}/${m}/${y}`;
  };

  return (
    <>
      <View style={styles.wrapper}>
        {/* Floating Label (BORDER CUT STYLE) */}
        {isFocused && (
          <View style={[styles.labelWrapper, { backgroundColor: inputBg }]}>
            <Text style={[styles.label, { color: themeColors.primary }]}>
              {label}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.container,
            {
              backgroundColor: inputBg,
              borderColor,
            },
          ]}
          onPress={() => setOpen(true)}
          activeOpacity={0.8}
        >
          <Text style={[styles.value, { color: value ? textColor : '#888' }]}>
            {value ? formatDate(value) : label}
          </Text>

          <Ionicons
            name="calendar-outline"
            size={18}
            color={themeColors.primary}
          />
        </TouchableOpacity>
        {error && <Text style={styles.error}>{error}</Text>}
      </View>

      <DatePicker
        modal
        open={open}
        date={
          value && !isNaN(new Date(value).getTime())
            ? new Date(value)
            : new Date()
        }
        mode="date"
        onConfirm={date => {
          setOpen(false);
          onChange(date);
        }}
        onCancel={() => setOpen(false)}
      />
    </>
  );
};

export default DatePickerr;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },

  container: {
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  value: {
    fontSize: 14,
    fontFamily: Fonts.Regular,
  },

  labelWrapper: {
    position: 'absolute',
    top: -8,
    left: 12,
    paddingHorizontal: 6,
    zIndex: 10,
  },

  label: {
    fontSize: 12,
    fontFamily: Fonts.Medium,
  },

  error: {
    color: '#ff4d4f',
    marginLeft: 6,
    marginTop: 4,
    fontSize: 12,
  },
});
