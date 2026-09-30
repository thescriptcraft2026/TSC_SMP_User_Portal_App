import React from 'react';
import { Platform } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

type Props = {
  withTopSpacing?: boolean;
};

const PostSkeleton = ({ withTopSpacing = true }: Props) => {
  const isDark = true;

  return (
    <SkeletonPlaceholder
      backgroundColor={isDark ? '#2a2a2a' : '#e7e8e8'}
      highlightColor={isDark ? '#3a3a3a' : '#F2F8FC'}
    >
      <SkeletonPlaceholder.Item
        marginTop={
          withTopSpacing
            ? Platform.OS === 'ios'
              ? 80
              : 90
            : 0
        }
      >
        <SkeletonPlaceholder.Item
          flexDirection="row"
          alignItems="center"
          paddingHorizontal={10}
          paddingVertical={10}
        >
          <SkeletonPlaceholder.Item
            width={36}
            height={36}
            borderRadius={18}
          />

          <SkeletonPlaceholder.Item marginLeft={10}>
            <SkeletonPlaceholder.Item width={120} height={12} />
            <SkeletonPlaceholder.Item width={80} height={10} marginTop={6} />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>

        <SkeletonPlaceholder.Item
          marginTop={12}
          width="100%"
          height={360}
        />
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );
};

export default PostSkeleton;