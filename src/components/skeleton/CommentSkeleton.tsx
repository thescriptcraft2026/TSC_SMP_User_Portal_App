import React from 'react';
import { View, useColorScheme } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const CommentSkeleton = () => {
  const isDark = true;

  return (
    <SkeletonPlaceholder
      backgroundColor={isDark ? '#2a2a2a' : '#e0e0e0'}
      highlightColor={isDark ? '#3a3a3a' : '#f5f5f5'}
      speed={1200}
    >
      <View>
        {[1, 2, 3].map(i => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            {/* Avatar */}
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
              }}
            />

            {/* Text */}
            <View style={{ marginLeft: 12, flex: 1 }}>
              <View
                style={{
                  width: '40%',
                  height: 10,
                  borderRadius: 4,
                  marginBottom: 6,
                }}
              />
              <View
                style={{
                  width: '80%',
                  height: 10,
                  borderRadius: 4,
                }}
              />
            </View>
          </View>
        ))}
      </View>
    </SkeletonPlaceholder>
  );
};

export default CommentSkeleton;
