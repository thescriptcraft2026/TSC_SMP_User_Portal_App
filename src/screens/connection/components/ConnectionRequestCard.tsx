import React, { useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  PanResponder,
} from 'react-native';
import { themeColors } from '../../../theme/colors';
import { Fonts } from '../../../constants/Fonts';
import Avatar from '../../../components/Avatar/Avatar';
import { useNavigation } from '@react-navigation/native';

const ConnectionRequestCard = ({ item, onAccept, onReject, onPress }: any) => {
  const isDark = true;
  const navigation = useNavigation<any>();

  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // 🎨 THEME
  const bg = isDark ? themeColors.card2 : themeColors.white;
  const textPrimary = isDark ? '#fff' : '#111';
  const textSecondary = isDark ? '#aaa' : '#666';

  // 🔥 SCALE ANIMATION
  const scale = translateX.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: [0.96, 1, 0.96],
    extrapolate: 'clamp',
  });

  const removeCard = (direction: 'left' | 'right') => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: direction === 'left' ? -400 : 400,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (direction === 'left') {
        onReject?.(item.id); // ❌ Reject
      } else {
        onAccept?.(item.id); // ✅ Accept
      }
    });
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10,

    onPanResponderMove: (_, g) => {
      translateX.setValue(g.dx);
    },

    onPanResponderRelease: (_, g) => {
      if (g.dx > 120) removeCard('right');
      else if (g.dx < -120) removeCard('left');
      else {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  return (
    <View style={{ marginBottom: 8 }}>
      {/* 🔥 CARD */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.card,
          {
            backgroundColor: bg,
            transform: [{ translateX }, { scale }],
            opacity,
          },
        ]}
      >
        {/* LEFT */}
        <View style={styles.left}>
          <View style={styles.avatarWrapper}>
            <Avatar uri={item.avatar} name={item.name} size={42} />
          </View>

          <TouchableOpacity
            onPress={onPress}
          >
            <Text style={[styles.name, { color: textPrimary }]}>
              {item.name}
            </Text>
            <Text style={[styles.title, { color: textSecondary }]}>
              {item.title}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ACTIONS */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.iconBtn,
              styles.declineBtn,
              {
                backgroundColor: isDark ? 'rgba(255,0,0,0.08)' : '#ffecec',
                borderColor: isDark ? 'rgba(239,68,68,0.4)' : '#ef4444',
              },
            ]}
            onPress={() => removeCard('left')}
          >
            <Text style={[styles.btnText, { color: '#ef4444' }]}>Decline</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.iconBtn,
              styles.acceptBtn,
              {
                backgroundColor: isDark ? 'rgba(34,197,94,0.08)' : '#eafff3',
                borderColor: isDark ? 'rgba(34,197,94,0.4)' : '#22c55e',
              },
            ]}
            onPress={() => removeCard('right')}
          >
            <Text
              style={[
                styles.btnText,
                {
                  color: isDark ? themeColors.lightGreen : themeColors.green,
                },
              ]}
            >
              Accept
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

export default ConnectionRequestCard;

const styles = StyleSheet.create({
  // 🔥 CARD
  card: {
    padding: 14,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // LEFT
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  avatarWrapper: {
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#fff',

    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  name: {
    fontFamily: Fonts.Bold,
    fontSize: 16,
  },

  title: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.7,
  },

  // ACTIONS
  actions: {
    flexDirection: 'row',
    gap: 8,
  },

  iconBtn: {
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  declineBtn: {
    borderWidth: 1,
    borderColor: '#ef4444',
  },

  acceptBtn: {
    borderWidth: 1,
    borderColor: '#22c55e',
  },

  btnText: {
    fontSize: 12,
    fontFamily: Fonts.Medium,
  },
});
