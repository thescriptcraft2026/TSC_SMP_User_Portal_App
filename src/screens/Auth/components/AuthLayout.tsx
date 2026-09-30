import React from 'react';
import {
  StyleSheet,
  View,
  ImageBackground,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

type Props = {
  children: React.ReactNode;
  header?: React.ReactNode;
};

const AuthLayout = ({ children, header }: Props) => {
  const isDark = useColorScheme() === 'dark';

  const cardBg = isDark ? '#1B1B1B' : '#fff';

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* HEADER */}
        <ImageBackground
          style={styles.topSection}
          source={require('../../assets/images/freepik__talk__6414-removebg-preview.png')}
          imageStyle={styles.bgImage}
        >
          {header}
        </ImageBackground>

        {/* CARD */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          {children}
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default AuthLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  topSection: {
    height: 420,
    justifyContent: 'center',
  },

  bgImage: {
    opacity: 0.25,
  },

  card: {
    flex: 1,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 25,
    marginTop: -40,

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
});
