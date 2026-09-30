import React from 'react';
import { View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { themeColors } from '../../theme/colors';

const PostDetailsSkeleton = () => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: themeColors.black,
      }}
    >
      <SkeletonPlaceholder
        backgroundColor="#1F1F22"
        highlightColor="#2B2B30"
        speed={1200}
      >
        <View style={{ padding: 16 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
              }}
            />

            <View style={{ marginLeft: 12 }}>
              <View
                style={{
                  width: 130,
                  height: 14,
                  borderRadius: 6,
                }}
              />

              <View
                style={{
                  width: 80,
                  height: 10,
                  borderRadius: 6,
                  marginTop: 8,
                }}
              />
            </View>
          </View>

          {/* Caption */}
          <View
            style={{
              width: '100%',
              height: 14,
              borderRadius: 6,
              marginTop: 24,
            }}
          />

          <View
            style={{
              width: '80%',
              height: 14,
              borderRadius: 6,
              marginTop: 10,
            }}
          />

          <View
            style={{
              width: '60%',
              height: 14,
              borderRadius: 6,
              marginTop: 10,
            }}
          />

          {/* Image */}
          <View
            style={{
              width: '100%',
              height: 360,
              borderRadius: 16,
              marginTop: 20,
            }}
          />

          {/* Actions */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 20,
              paddingHorizontal: 20,
            }}
          >
            <View
              style={{
                width: 60,
                height: 20,
                borderRadius: 6,
              }}
            />
            <View
              style={{
                width: 60,
                height: 20,
                borderRadius: 6,
              }}
            />
            <View
              style={{
                width: 60,
                height: 20,
                borderRadius: 6,
              }}
            />
          </View>

          {/* Comments */}
          {[1, 2, 3].map(i => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                marginTop: 24,
                alignItems: 'flex-start',
              }}
            >
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                }}
              />

              <View
                style={{
                  marginLeft: 12,
                  flex: 1,
                }}
              >
                <View
                  style={{
                    width: 120,
                    height: 12,
                    borderRadius: 6,
                  }}
                />

                <View
                  style={{
                    width: '100%',
                    height: 12,
                    borderRadius: 6,
                    marginTop: 10,
                  }}
                />

                <View
                  style={{
                    width: '70%',
                    height: 12,
                    borderRadius: 6,
                    marginTop: 8,
                  }}
                />
              </View>
            </View>
          ))}
        </View>
      </SkeletonPlaceholder>
    </View>
  );
};

export default PostDetailsSkeleton;
