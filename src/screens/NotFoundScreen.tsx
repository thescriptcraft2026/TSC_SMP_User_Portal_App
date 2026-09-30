import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { themeColors } from '../theme/colors';
import PrimaryButton from '../components/Buttons/PrimaryButton';

type Props = {
  title?: string;
  description?: string;
  icon?: string;
  showButton?: boolean;
};

const NotFoundScreen = ({
  title = '404',
  description = 'The page you are looking for could not be found.',
  icon = 'warning-outline',
  showButton = true,
}: Props) => {
  const navigation = useNavigation<any>();
  const isDark = true;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isDark ? '#1E293B' : '#E2E8F0',
          },
        ]}
      >
        <Ionicons
          name={icon as any}
          size={70}
          color={themeColors.primary}
        />
      </View>

      <Text
        style={[
          styles.title,
          { color: isDark ? '#fff' : '#111' },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.description,
          { color: isDark ? '#999' : '#666' },
        ]}
      >
        {description}
      </Text>

      {showButton && (
        <PrimaryButton title='Go Back' onPress={() => navigation.goBack()} variant='filled' /> 
      )}
    </View>
  );
};

export default NotFoundScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 500,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor:themeColors.black
  },

  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },

  description: {
    marginTop: 10,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});