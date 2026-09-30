import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import AuthHeader from '../../components/Header/AuthHeader';
import { themeColors } from '../../theme/colors';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import FloatingInputTwo from '../../components/Input/FloatingInputTwo';
import FloatingDropdown from '../../components/DropDown/FloatingDropdown';

import { Fonts } from '../../constants/Fonts';

import Plus from '../../assets/SVG/Plus';
import Trash from '../../assets/SVG/Trash';
import Pen from '../../assets/SVG/Pen';

import api from '../../../Instance/Instance';

import { useForm, Controller } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useToast } from '../../components/Toast/ToastProvider';

const SOCIAL_PLATFORMS = [
  'Instagram',
  'Twitter',
  'LinkedIn',
  'YouTube',
  'GitHub',
  'Facebook',
  'Pinterest',
  'Discord',
  'Twitch',
  'Reddit',
  'Telegram',
  'WhatsApp',
  'Behance',
  'Mastodon',
  'Other',
];

type FormValues = {
  platform: string;
  customPlatform: string;
  socialLink: string;

  showcaseLink: string;

  websiteLink: string;
};

const OnlinePrefrence = () => {
  const navigation = useNavigation<any>();
  const isDark = true;
  const text = isDark ? '#fff' : '#000';
  const { show } = useToast();

  const { user } = useSelector((state: any) => state.profile);

  console.log('user data', user);

  // =========================================
  // REACT HOOK FORM
  // =========================================

  const { control, handleSubmit, watch, setValue, resetField } =
    useForm<FormValues>({
      defaultValues: {
        platform: '',
        customPlatform: '',
        socialLink: '',
        showcaseLink: '',
        websiteLink: '',
      },
    });

  const selectedPlatform = watch('platform');

  const customPlatform = watch('customPlatform');

  const socialLink = watch('socialLink');

  const showcaseLink = watch('showcaseLink');

  const websiteLink = watch('websiteLink');

  // =========================================
  // SOCIAL MEDIA
  // =========================================

  const [socialLinks, setSocialLinks] = useState<any[]>(
    user?.user_works?.filter(
      (item: any) => item.type !== 'showcase' && item.type !== 'website',
    ) || [],
  );

  // =========================================
  // SHOWCASE
  // =========================================

  const [showcaseLinks, setShowcaseLinks] = useState<any[]>(
    user?.user_works?.filter((item: any) => item.type === 'showcase') || [],
  );

  const [editingShowcaseIndex, setEditingShowcaseIndex] = useState<
    number | null
  >(null);

  // =========================================
  // WEBSITE
  // =========================================

  const [websiteLinks, setWebsiteLinks] = useState<any[]>(
    user?.user_works?.filter((item: any) => item.type === 'website') || [],
  );

  const [editingWebsiteIndex, setEditingWebsiteIndex] = useState<number | null>(
    null,
  );

  // =========================================
  // ADD / UPDATE SHOWCASE
  // =========================================

  const handleAddShowcase = () => {
    if (!showcaseLink.trim()) {
      Alert.alert('Please enter showcase link');
      return;
    }

    const item = {
      type: 'showcase',
      link: showcaseLink,
    };

    console.log('SHOWCASE UI ITEM:', item);

    if (editingShowcaseIndex !== null) {
      const updated = [...showcaseLinks];

      updated[editingShowcaseIndex] = item;

      setShowcaseLinks(updated);

      setEditingShowcaseIndex(null);
    } else {
      setShowcaseLinks(prev => [...prev, item]);
    }

    resetField('showcaseLink');
  };

  // =========================================
  // ADD / UPDATE WEBSITE
  // =========================================

  const handleAddWebsite = () => {
    if (!websiteLink.trim()) {
      Alert.alert('Please enter website link');
      return;
    }

    const item = {
      type: 'website',
      link: websiteLink,
    };

    console.log('WEBSITE UI ITEM:', item);

    if (editingWebsiteIndex !== null) {
      const updated = [...websiteLinks];

      updated[editingWebsiteIndex] = item;

      setWebsiteLinks(updated);

      setEditingWebsiteIndex(null);
    } else {
      setWebsiteLinks(prev => [...prev, item]);
    }

    resetField('websiteLink');
  };

  // =========================================
  // SAVE
  // =========================================

  const onSubmit = async () => {
    try {
      const payload = [...socialLinks, ...showcaseLinks, ...websiteLinks];

      console.log(
        'FINAL ONLINE PREFERENCE PAYLOAD:',
        JSON.stringify(payload, null, 2),
      );

      const res = await api.post('/profile/work-links', {
        links: payload,
      });
      console.log('final api res', res?.data);
      navigation.goBack();
      show({
        type: 'success',
        title:
          res?.data?.message || 'Online preferences Added/updated successfully',
      });
    } catch (error: any) {
      console.log('SAVE ERROR:', error);
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        error ||
        'Something went wrong';

      show({
        type: 'error',
        title: errorMessage,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: isDark ? themeColors.black : themeColors.appBackground,
      }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <AuthHeader
          showBack
          title="Online Preference"
          onBack={() => navigation.goBack()}
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* ========================================= */}
          {/* SHOWCASE */}
          {/* ========================================= */}

          <SectionCard title="Showcase Links">
            {showcaseLinks.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.cardTwo,
                  {
                    backgroundColor: themeColors.card2,
                    marginBottom: 10,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: text,
                      fontFamily: Fonts.Bold,
                      fontSize: 13,
                    }}
                  >
                    Showcase
                  </Text>

                  <Text
                    style={{
                      color: text,
                      fontFamily: Fonts.Regular,
                      fontSize: 11,
                      marginTop: 2,
                    }}
                    numberOfLines={1}
                  >
                    {item.link}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      setValue('showcaseLink', showcaseLinks[index].link);

                      setEditingShowcaseIndex(index);
                    }}
                  >
                    <Pen size={16} color={text} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setShowcaseLinks(prev =>
                        prev.filter((_, i) => i !== index),
                      );
                    }}
                  >
                    <Trash size={16} color={themeColors.red} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View
              style={[
                styles.formCard,
                {
                  backgroundColor: themeColors.card2,
                },
              ]}
            >
              <Controller
                control={control}
                name="showcaseLink"
                render={({ field: { onChange, value } }) => (
                  <FloatingInputTwo
                    label="Link"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />

              <TouchableOpacity
                onPress={handleAddShowcase}
                style={[styles.addButton]}
              >
                <Plus color={text} />

                <Text
                  style={{
                    color: text,
                    fontFamily: Fonts.Medium,
                    fontSize: 14,
                  }}
                >
                  {editingShowcaseIndex !== null
                    ? 'Update Showcase'
                    : 'Add Showcase'}
                </Text>
              </TouchableOpacity>
            </View>
          </SectionCard>

          {/* ========================================= */}
          {/* WEBSITE */}
          {/* ========================================= */}

          <SectionCard title="Website Links">
            {websiteLinks.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.cardTwo,
                  {
                    backgroundColor: themeColors.card2,
                    marginBottom: 10,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: text,
                      fontFamily: Fonts.Bold,
                      fontSize: 13,
                    }}
                  >
                    Website
                  </Text>

                  <Text
                    style={{
                      color: text,
                      fontFamily: Fonts.Regular,
                      fontSize: 11,
                      marginTop: 2,
                    }}
                    numberOfLines={1}
                  >
                    {item.link}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      setValue('websiteLink', websiteLinks[index].link);

                      setEditingWebsiteIndex(index);
                    }}
                  >
                    <Pen size={16} color={text} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setWebsiteLinks(prev =>
                        prev.filter((_, i) => i !== index),
                      );
                    }}
                  >
                    <Trash size={16} color={themeColors.red} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View
              style={[
                styles.formCard,
                {
                  backgroundColor: themeColors.card2,
                },
              ]}
            >
              <Controller
                control={control}
                name="websiteLink"
                render={({ field: { onChange, value } }) => (
                  <FloatingInputTwo
                    label="Link"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />

              <TouchableOpacity
                onPress={handleAddWebsite}
                style={[styles.addButton]}
              >
                <Plus color={text} />

                <Text
                  style={{
                    color: text,
                    fontFamily: Fonts.Medium,
                    fontSize: 14,
                  }}
                >
                  {editingWebsiteIndex !== null
                    ? 'Update Website'
                    : 'Add Website'}
                </Text>
              </TouchableOpacity>
            </View>
          </SectionCard>

          <PrimaryButton
            title="Save Changes"
            onPress={handleSubmit(onSubmit)}
          />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default OnlinePrefrence;

// =========================================
// SECTION CARD
// =========================================

const SectionCard = ({ title, children }: any) => {
  const isDark = true;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#1c1c1e' : themeColors.white,
        },
      ]}
    >
      <Text
        style={[
          styles.cardTitle,
          {
            color: isDark ? '#fff' : '#000',
          },
        ]}
      >
        {title}
      </Text>

      {children}
    </View>
  );
};

// =========================================
// STYLES
// =========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scroll: {
    marginHorizontal: 10,
  },

  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },

  cardTitle: {
    fontSize: 16,
    fontFamily: Fonts.Bold,
    marginBottom: 14,
  },

  cardTwo: {
    paddingVertical: 10,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
  },

  formCard: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 8,
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 6,
    backgroundColor: themeColors.primary,
    borderRadius: 8,
    marginTop: 12,
  },
});
