import React from 'react';
import { ActivityIndicator, FlatList, Text } from 'react-native';
import { themeColors } from '../../../../theme/colors';
import ConnectionItem from '../ConnectionItem';

const ConnectionList = ({
  users,
  updateRelation,
  onProfileView,
  startChat,
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
          type="connection"
          updateRelation={updateRelation}
          onProfileView={() => onProfileView(item)}
          startChat={startChat}
        />
      )}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={<Text>No connections</Text>}
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

export default ConnectionList;
