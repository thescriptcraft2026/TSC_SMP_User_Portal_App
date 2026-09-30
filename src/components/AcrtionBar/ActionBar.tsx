import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Animated,
} from 'react-native';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import { useLikeAnimation } from '../../hooks/useLikeAnimation';
import { LikeParticles } from '../Like/LikeParticles';

type ActionItemType = {
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  label?: string | any;
  title?: string;
  onPress?: () => void;
  isLike?: boolean; // 👈 NEW
  liked?: boolean; // 👈 NEW
  emoji_type?: any;
  onLongPress?: () => void; // 👈 NEW (optional)
  disabled?: boolean;
};

type Props = {
  items: ActionItemType[];
  backgroundColor?: any;
  variant?: 'default' | 'floating'; // 👈 NEW
  style?: any; // 👈 allow override
};

const ActionBar = ({
  items,
  backgroundColor,
  variant = 'default',
  style,
}: Props) => {
  const isDark = true;

  const { likeScale, particleAnims, animateLike, animateParticles } =
    useLikeAnimation();

  return (
    <View
      style={[
        styles.container,

        variant === 'floating' && styles.floatingContainer, // 👈 NEW

        {
          backgroundColor:
            backgroundColor ?? (isDark ? themeColors.card2 : themeColors.white),
        },

        style, // 👈 external override
      ]}
    >
      {items.map((item, index) => {
        const isLike = item.isLike;

        return (
          <React.Fragment key={index}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <TouchableOpacity
                style={[
                  styles.item,
                  {
                    opacity: item.disabled ? 0.5 : 1,
                  },
                ]}
                activeOpacity={0.8}
                disabled={item.disabled}
                delayLongPress={200}
                onLongPress={() => {
                  if (item.disabled) return;

                  item.onLongPress?.();
                }}
                onPress={() => {
                  if (item.disabled) return;

                  item.onPress?.();

                  if (isLike) {
                    requestAnimationFrame(() => {
                      animateLike();
                      animateParticles();
                    });
                  }
                }}
              >
                {/* ❤️ LIKE ITEM */}
                {isLike ? (
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    {/* 🔥 icon */}
                    <Animated.View
                      style={{
                        transform: [{ scale: likeScale }],
                        zIndex: 5,
                      }}
                    >
                      {!!item.liked ? (
                        item.emoji_type === 'Love' ? (
                          <Animated.Image
                            source={require('../../assets/Likes/heart_eyes.png')}
                            style={{ width: 18, height: 18 }}
                          />
                        ) : item.emoji_type === 'Claps' ? (
                          <Animated.Image
                            source={require('../../assets/Likes/clap.png')}
                            style={{ width: 18, height: 18 }}
                          />
                        ) : item.emoji_type === 'Laugh' ? (
                          <Animated.Image
                            source={require('../../assets/Likes/joy.png')}
                            style={{ width: 18, height: 18 }}
                          />
                        ) : item.emoji_type === 'Joy' ? (
                          <Animated.Image
                            source={require('../../assets/Likes/partying_face.png')}
                            style={{ width: 18, height: 18 }}
                          />
                        ) : (
                          <Animated.Image
                            source={require('../../assets/Likes/heart.png')}
                            style={{ width: 18, height: 18 }}
                          />
                        )
                      ) : (
                        item.icon
                      )}
                    </Animated.View>
                  </View>
                ) : (
                  item.icon
                )}

                {item.label && (
                  <Text
                    style={[
                      styles.text,
                      { color: isDark ? themeColors.white : themeColors.black },
                    ]}
                  >
                    {item.label}
                  </Text>
                )}
              </TouchableOpacity>
              <Text
                style={[
                  styles.titleText,
                  {
                    color: isDark ? 'rgba(255,255,255,0.7)' : '#666',
                  },
                ]}
              >
                {item.title}
              </Text>
            </View>

            {index !== items.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        );
      })}
    </View>
  );
};

export default ActionBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    overflow: 'visible', // 🔥 ADD THIS
    zIndex: 1,
  },

  floatingContainer: {
    position: 'absolute',
    bottom: -20,
    left: 40,
    right: 40,
    borderRadius: 25,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    gap: 6,
    overflow: 'visible', // 🔥 ADD THIS
  },

  text: {
    fontSize: 12,
    fontFamily: Fonts.Regular,
  },

  titleText: {
    fontSize: 11,
    // marginTop: 2,
    fontFamily: Fonts.Regular,
  },

  divider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(150,150,150,0.3)',
  },
});
