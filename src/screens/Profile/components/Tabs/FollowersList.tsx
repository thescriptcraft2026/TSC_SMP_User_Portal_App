import React from 'react';
import { ActivityIndicator, FlatList } from 'react-native';
import { themeColors } from '../../../../theme/colors';
import ConnectionItem from '../ConnectionItem';

const FollowersList = ({
  users,
  updateRelation,
  onProfileView,
  currentUserName,
  onEndReached,
  loadingMore,
}: any) => {
  return (
    <FlatList
      data={users}
      keyExtractor={item => item.id.toString()}
      contentContainerStyle={{ padding: 10 }}
      renderItem={({ item }) => (
        <ConnectionItem
          item={item}
          type="followers"
          updateRelation={updateRelation}
          onProfileView={() => onProfileView(item)}
          currentUserName={currentUserName}
        />
      )}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loadingMore ? (
          <ActivityIndicator
            size="small"
            color={themeColors.primary}
            style={{ marginVertical: 20 }}
          />
        ) : null
      }
    />
  );
};

export default FollowersList;
