import React from 'react';
import { View, Text, StyleSheet, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';

type Props = {
  value?: string;
  limit: number;
  stripHtml?: boolean;
  hint?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

const CharacterCount = ({
  value,
  limit,
  stripHtml = false,
  hint,
  style,
  textStyle,
}: Props) => {
  const text = stripHtml
    ? (value || '').replace(/<[^>]*>/g, '').trim()
    : value || '';

  return (
    <View style={[styles.row, style]}>
      <Text style={[styles.text, textStyle]}>
        {text.length} / {limit}
      </Text>
      {!!hint && <Text style={[styles.text, textStyle]}>{hint}</Text>}
    </View>
  );
};

export default CharacterCount;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginTop: -12,
    marginBottom: 16,
  },
  text: {
    fontSize: 12,
    fontFamily: Fonts.Regular,
    color: themeColors.secondary,
  },
});
