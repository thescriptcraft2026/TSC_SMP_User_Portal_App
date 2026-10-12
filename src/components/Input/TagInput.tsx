import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Animated,
  Text,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';

import Feather from '@react-native-vector-icons/feather';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  suggestions?: string[];
  onSelectSuggestion?: (tag: string) => void;
  error?: string;
};

const TagInput = ({
  label,
  value,
  onChangeText,
  tags,
  setTags,
  suggestions = [],
  onSelectSuggestion,
  error,
}: Props) => {
  const isDark = true;
  const [focused, setFocused] = useState(false);

  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value || focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, focused]);

  const handleAddTag = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (!tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    onChangeText('');
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const labelStyle = {
    position: 'absolute' as const,
    left: 14,
    top: anim.interpolate({ inputRange: [0, 1], outputRange: [16, -8] }),
    fontSize: anim.interpolate({ inputRange: [0, 1], outputRange: [15, 12] }),
  };

  return (
    <View style={{ marginBottom: 16 }}>
      {/* INPUT */}
      <View
        style={[
          styles.container,
          {
            borderColor: focused
              ? themeColors.primary
              : isDark
              ? 'rgba(255,255,255,0.2)'
              : '#ddd',
            backgroundColor: isDark ? '#1e1e1e' : '#fff',
          },
        ]}
      >
        {/* LABEL */}
        <Animated.Text
          style={[
            labelStyle,
            styles.label,
            {
              backgroundColor: isDark ? '#1c1c1e' : '#fff',
              color: isDark ? '#aaa' : '#666',
            },
          ]}
        >
          {label}
        </Animated.Text>

        {/* TEXT INPUT */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          style={[
            styles.input,
            { color: isDark ? themeColors.white : themeColors.black },
          ]}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={() => {
            if (value.trim() && !tags.includes(value.trim())) {
              setTags([...tags, value.trim()]);
              onChangeText('');
            }
          }}
        />
      </View>

      {/* SUGGESTIONS */}
      {value.length > 0 && suggestions.length > 0 && (
        <View
          style={[
            styles.suggestions,
            {
              backgroundColor: isDark ? '#2a200a' : '#fff8ee',
              borderColor: isDark ? '#5a3f00' : '#f0d9a8',
            },
          ]}
        >
          {suggestions.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => {
                onSelectSuggestion?.(item);
                onChangeText('');
              }}
            >
              <Text
                style={[
                  styles.suggestionText,
                  { color: isDark ? '#f5c97a' : '#7a5200' },
                ]}
              >
                #{item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* CREATE NEW TAG */}
      {suggestions.length === 0 && value.length > 0 && (
        <TouchableOpacity
          style={[
            styles.createRow,
            {
              backgroundColor: isDark ? '#0e1f0e' : '#eef8f1',
              borderColor: isDark ? '#2d5c2d' : '#b2dfc1',
            },
          ]}
          onPress={() => {
            if (!tags.includes(value.trim())) {
              setTags([...tags, value.trim()]);
            }
            onChangeText('');
          }}
        >
          <Text
            style={[
              styles.createText,
              { color: isDark ? '#a0d870' : themeColors.successDark },
            ]}
          >
            Create "#{value}"
          </Text>
        </TouchableOpacity>
      )}

      {/* TAGS */}
      <View style={styles.tagsContainer}>
        {tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>#{tag}</Text>
            <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
              <Feather name="x" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* ERROR */}
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

export default TagInput;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 52,
    justifyContent: 'center',
  },
  label: {
    paddingHorizontal: 4,
    fontFamily: Fonts.Bold,
  },
  input: {
    fontSize: 15,
  },
  // ✅ No isDark here — only static values
  suggestions: {
    marginTop: 6,
    borderWidth: 0.5,
    borderRadius: 8,
    padding: 6,
  },
  suggestionItem: {
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  suggestionHash: {
    color: themeColors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  suggestionText: {
    fontSize: 13,
  },
  createRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 0.5,
    borderRadius: 8,
    padding: 8,
  },
  createText: {
    fontSize: 13,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 6,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
  },
  tagText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    marginRight: 2,
  },
  error: {
    color: themeColors.dangerDark,
    marginTop: 6,
    fontSize: 12,
    marginLeft: 4,
  },
});
