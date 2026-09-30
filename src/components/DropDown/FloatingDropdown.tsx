import React, { useEffect, useRef, useState } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Pressable,
  useColorScheme,
  Animated,
  View,
  Platform,
  TextInput,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';

type Props = {
  label: any;
  value?: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
  style?: any;
  error?: string;
  searchable?: boolean; // 👈 optional
};

const FloatingDropdown = ({
  label,
  value,
  onChange,
  options,
  style,
  error,
  searchable = false,
}: Props) => {
  const isDark = true;
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');
  const animated = useRef(new Animated.Value(value ? 1 : 0)).current;

  const isFocused = visible || !!value;

  useEffect(() => {
    Animated.timing(animated, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const inputBg = isDark ? '#1c1c1e' : '#fff';
  const borderColor = isDark
    ? 'rgba(255,255,255,0.2)'
    : 'rgba(0,0,0,0.2)';
  const textColor = isDark ? '#fff' : '#000';
  const selectedLabel = options.find(opt => opt.value === value)?.label;
  const filteredOptions = searchable
    ? options.filter(item =>
      item.label.toLowerCase().includes(search.toLowerCase()),
    )
    : options;
  return (
    <>
      {/* Field */}
      <View style={[styles.wrapper, style]}>
        {/* Floating Label (ON BORDER) */}
        {isFocused && (
          <Animated.View
            style={[
              styles.labelWrapper,
              {
                backgroundColor: inputBg,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: error ? '#ff4d4f' : themeColors.primary },
              ]}
            >
              {label}
            </Text>
          </Animated.View>
        )}

        <TouchableOpacity
          style={[
            styles.container,
            {
              backgroundColor: inputBg,
              borderColor,
            },
            style,
          ]}
          onPress={() => {
            setSearch('');
            setVisible(true);
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.value, { color: value ? textColor : '#888' }]}>
            {selectedLabel || label}
          </Text>

          <Ionicons name="chevron-down" size={18} color="#888" />
        </TouchableOpacity>
        {error && <Text style={styles.error}>{error}</Text>}
      </View>

      {/* Bottom Sheet */}
      <Modal visible={visible} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setVisible(false)} />

        <View
          style={[
            styles.sheet,
            { backgroundColor: isDark ? '#1c1c1e' : '#fff' },
          ]}
        >
          {/* <Text style={[styles.sheetTitle, { color: textColor }]}>{label}</Text> */}

          {searchable && (
            <TextInput
              placeholder={`Search ${label}`}
              placeholderTextColor="#888"
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
              autoCapitalize="none"
              style={[
                styles.searchInput,
                {
                  color: isDark ? '#fff' : '#000',
                  backgroundColor: isDark ? '#2a2a2d' : '#f5f5f5',
                },
              ]}
            />
          )}

          <FlatList
            data={filteredOptions}
            keyExtractor={item => item.value.toString()}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No results found
              </Text>
            }
            renderItem={({ item }:any) => {
              const selected = item.value === value;

              return (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    onChange(item.value);
                    setVisible(false);
                    setSearch('');
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
                    <Text
                      style={[
                        styles.optionText,
                        { color: isDark ? themeColors.white : themeColors.black },
                        selected && { color: themeColors.primary },
                      ]}
                    >
                      {item.label}
                    </Text>

                    {item?.sublabel && (
                      <Text style={styles.sublabelText}>
                        ({item?.sublabel})
                      </Text>
                    )}
                  </View>

                  {selected && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={themeColors.primary}
                    />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
    </>
  );
};

export default FloatingDropdown;

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

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  sheet: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 13 : 10,
    left: 10,
    right: 10,
    borderBottomLeftRadius: Platform.OS === 'ios' ? 50 : 20,
    borderBottomRightRadius: Platform.OS === 'ios' ? 50 : 20,
    maxHeight: '60%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 30,
  },

  sheetTitle: {
    fontSize: 16,
    fontFamily: Fonts.Bold,
    marginBottom: 12,
  },

  option: {
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  optionText: {
    fontSize: 14,
  },

  sublabelText: {
    fontSize: 12,
    color: '#888',
    fontFamily: Fonts.Regular,
  },

  error: {
    color: '#ff4d4f',
    marginLeft: 6,
    marginTop: 4,
    fontSize: 12,
  },

  searchInput: {
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 14,
  },

  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 30,
    fontSize: 14,
  },
});
