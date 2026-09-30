import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import Icon from '@react-native-vector-icons/feather';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';

const AppInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  secure = false,
}: any) => {
  const [hidePassword, setHidePassword] = useState(secure);
  const isDark = true;

  return (
    <View style={styles.container}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: isDark ? themeColors.white : themeColors.black },
          ]}
        >
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputBox,
          {
            borderColor: isDark ? '#333' : '#DDD',
            backgroundColor: isDark ? '#111' : '#fff',
          },
        ]}
      >
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#888' : '#999'}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={hidePassword}
          style={[
            styles.input,
            { color: isDark ? themeColors.white : themeColors.black },
          ]}
        />

        {secure && (
          <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
            <Icon
              name={hidePassword ? 'eye-off' : 'eye'}
              size={14}
              color={isDark ? '#aaa' : '#555'}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default AppInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#444',
    fontFamily: Fonts.Medium,
  },

  inputBox: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    height: 45,
    fontSize: 15,
  },
});
