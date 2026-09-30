import { Text, View } from 'react-native';
import { Fonts } from '../../constants/Fonts';

export const CollaborationBadge = ({ type }: { type: 'WORK' | 'HIRING' }) => {
  const isWork = type === 'WORK';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isWork ? '#E6F4EA' : '#EFE7FF', // light bg
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 20,
        alignSelf: 'flex-start',
      }}
    >
      {/* Dot */}
      <View
        style={{
          width: 7,
          height: 7,
          borderRadius: 4,
          backgroundColor: isWork ? '#2E7D32' : '#7B3FE4',
          marginRight: 6,
        }}
      />

      {/* Text */}
      <Text
        style={{
          color: isWork ? '#2E7D32' : '#7B3FE4',
          fontSize: 11,
          fontFamily:Fonts.Medium,
        }}
      >
        {isWork ? 'Open to work' : 'Hiring'}
      </Text>
    </View>
  );
};
