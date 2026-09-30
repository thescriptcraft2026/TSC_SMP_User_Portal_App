import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const VisionCardSkeleton = () => {
  return (
    <View style={styles.container}>
      <SkeletonPlaceholder
        backgroundColor="#2A2A2A"
        highlightColor="#3A3A3A"
      >
        <SkeletonPlaceholder.Item
          borderRadius={14}
          backgroundColor="#111119"
        >
          {/* Header */}
          <SkeletonPlaceholder.Item
            flexDirection="row"
            alignItems="center"
            paddingHorizontal={12}
            paddingTop={12}
            paddingBottom={10}
          >
            <SkeletonPlaceholder.Item
              width={36}
              height={36}
              borderRadius={18}
            />

            <SkeletonPlaceholder.Item marginLeft={10} flex={1}>
              <SkeletonPlaceholder.Item
                width={120}
                height={14}
                borderRadius={4}
              />
              <SkeletonPlaceholder.Item
                marginTop={8}
                width={70}
                height={10}
                borderRadius={4}
              />
            </SkeletonPlaceholder.Item>

            <SkeletonPlaceholder.Item
              width={28}
              height={28}
              borderRadius={14}
            />
          </SkeletonPlaceholder.Item>

          {/* Image */}
          <SkeletonPlaceholder.Item
            width="100%"
            height={240}
          />

          {/* Caption */}
          <SkeletonPlaceholder.Item padding={12}>
            <SkeletonPlaceholder.Item
              width="95%"
              height={12}
              borderRadius={4}
            />
            <SkeletonPlaceholder.Item
              marginTop={8}
              width="80%"
              height={12}
              borderRadius={4}
            />
            <SkeletonPlaceholder.Item
              marginTop={8}
              width="60%"
              height={12}
              borderRadius={4}
            />
          </SkeletonPlaceholder.Item>

          {/* Actions */}
          <SkeletonPlaceholder.Item
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            paddingHorizontal={15}
            paddingVertical={14}
          >
            <SkeletonPlaceholder.Item flexDirection="row">
              <SkeletonPlaceholder.Item
                width={50}
                height={18}
                borderRadius={6}
              />
              <SkeletonPlaceholder.Item
                marginLeft={20}
                width={50}
                height={18}
                borderRadius={6}
              />
              <SkeletonPlaceholder.Item
                marginLeft={20}
                width={50}
                height={18}
                borderRadius={6}
              />
              <SkeletonPlaceholder.Item
                marginLeft={20}
                width={24}
                height={24}
                borderRadius={12}
              />
            </SkeletonPlaceholder.Item>

            <SkeletonPlaceholder.Item
              width={24}
              height={24}
              borderRadius={4}
            />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    </View>
  );
};

export default React.memo(VisionCardSkeleton);

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
});