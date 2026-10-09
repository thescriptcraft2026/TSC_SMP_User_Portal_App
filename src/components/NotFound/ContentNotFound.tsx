import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AuthHeader from '../Header/AuthHeader';
import NotFoundScreen from '../../screens/NotFoundScreen';
import PrimaryButton from '../Buttons/PrimaryButton';
import { themeColors } from '../../theme/colors';

type Props = {
  /** Header title, e.g. "Opportunity Details" */
  headerTitle: string;
  /** Message title, e.g. "Opportunity Not Found" */
  title: string;
  description: string;
  icon?: string;
};

/**
 * One shared "content not found" screen for all detail screens (deleted,
 * private or invalid links). Back goes to the previous screen, or to Home
 * when the app was opened straight from a link and there is nothing behind it.
 */
const ContentNotFound = ({
  headerTitle,
  title,
  description,
  icon = 'document-text-outline',
}: Props) => {
  const navigation = useNavigation<any>();

  const goBackOrHome = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('BottomTab');
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: themeColors.black }}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <AuthHeader
        title={headerTitle}
        showBack
        fontSize={20}
        onBack={goBackOrHome}
      />

      <NotFoundScreen
        title={title}
        description={description}
        icon={icon}
        showButton={false}
      />

      <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <PrimaryButton
          title="Go Back"
          onPress={goBackOrHome}
          variant="filled"
        />
      </View>
    </SafeAreaView>
  );
};

export default ContentNotFound;
