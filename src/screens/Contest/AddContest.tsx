import React, { useMemo, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';

import AuthHeader from '../../components/Header/AuthHeader';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import FloatingInputTwo from '../../components/Input/FloatingInputTwo';
import ImageUploader, {
  ImageType,
} from '../../components/ImageUploader/ImageUploader';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import FloatingDropdown from '../../components/DropDown/FloatingDropdown';
import DatePickerr from '../../components/Input/DatePicker';

type FormData = {
  title: string;
  description: string;
  poster: ImageType[];
  type: string;
  genre: string;
  startDate: Date | null;
  endDate: Date | null;
  roles: string[];
};

const rolesList = [
  'Actor',
  'Director',
  'Writer',
  'Cinematographer',
  'Editor',
  'Producer',
  'Sound Designer',
  'VFX Artist',
  'Animator',
  'Musician',
];

const AddContest = () => {
  const navigation = useNavigation<any>();
  const isDark = true;

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const { control, handleSubmit, setValue } = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      poster: [],
      type: '',
      genre: '',
      startDate: null,
      endDate: null,
      roles: [],
    },
  });

  const backgroundColor = useMemo(
    () => (isDark ? themeColors.black : themeColors.appBackground),
    [isDark],
  );

  const cardBg = isDark ? '#1c1c1e' : themeColors.slate;

  const toggleRole = (role: string) => {
    let updated = [];

    if (selectedRoles.includes(role)) {
      updated = selectedRoles.filter(r => r !== role);
    } else {
      updated = [...selectedRoles, role];
    }

    setSelectedRoles(updated);
    setValue('roles', updated);
  };

  const onSubmit = (data: FormData) => {
    console.log('Contest Data:', data);
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        translucent
        barStyle={'light-content'}
      />

      <AuthHeader
        showBack
        title="Create Contest"
        onBack={() => navigation.goBack()}
      />

      <FlatList
        data={[]}
        renderItem={() => null}
        keyExtractor={() => 'form'}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            {/* Contest Info */}
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <Text style={[
                styles.sectionTitle,
                { color: isDark ? themeColors.white : themeColors.black },
              ]}>Contest Info</Text>

              <Controller
                control={control}
                name="title"
                rules={{ required: 'Title is required' }}
                render={({ field: { onChange, value } }) => (
                  <FloatingInputTwo
                    label="Contest Title"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />

              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value } }) => (
                  <FloatingInputTwo
                    label="Description"
                    value={value}
                    onChangeText={onChange}
                    multiline
                    height={100}
                  />
                )}
              />
            </View>

            {/* Poster */}
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <Text style={[
                styles.sectionTitle,
                { color: isDark ? themeColors.white : themeColors.black },
              ]}>Contest Poster</Text>

              <Controller
                control={control}
                name="poster"
                render={({ field: { value, onChange } }) => (
                  <ImageUploader images={value} onChange={onChange} />
                )}
              />
            </View>

            {/* Type & Genre (Dropdowns) */}
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <Text style={[
                styles.sectionTitle,
                { color: isDark ? themeColors.white : themeColors.black },
              ]}>Contest Details</Text>

              <Controller
                control={control}
                name="type"
                render={({ field: { value, onChange } }) => (
                  <FloatingDropdown
                    label="Contest Type"
                    value={value}
                    onChange={onChange}
                    options={[
                      { label: 'Short Film', value: 'Short Film' },
                      { label: 'Story Writing', value: 'Story Writing' },
                      { label: 'Photography', value: 'Photography' },
                      { label: 'Music', value: 'Music' },
                      { label: 'Acting', value: 'Acting' },
                    ]}
                  />
                )}
              />

              <Controller
                control={control}
                name="genre"
                render={({ field: { value, onChange } }) => (
                  <FloatingDropdown
                    label="Genre (Optional)"
                    value={value}
                    onChange={onChange}
                    options={[
                      { label: 'Action', value: 'Action' },
                      { label: 'Drama', value: 'Drama' },
                    ]}
                  />
                )}
              />
            </View>

            {/* Dates */}
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <Text style={[
                styles.sectionTitle,
                { color: isDark ? themeColors.white : themeColors.black },
              ]}>Dates</Text>

              <Controller
                control={control}
                name="startDate"
                render={({ field: { value, onChange } }) => (
                  <DatePickerr
                    label="Start Date"
                    value={value}
                    onChange={onChange}
                  />
                )}
              />

              <Controller
                control={control}
                name="endDate"
                render={({ field: { value, onChange } }) => (
                  <DatePickerr
                    label="End Date"
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
            </View>

            {/* Roles */}
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <Text style={[
                styles.sectionTitle,
                { color: isDark ? themeColors.white : themeColors.black },
              ]}>Contest Roles</Text>

              <View style={styles.rolesContainer}>
                {rolesList.map(role => {
                  const selected = selectedRoles.includes(role);

                  return (
                    <TouchableOpacity
                      key={role}
                      style={[styles.chip, selected && styles.chipSelected]}
                      onPress={() => toggleRole(role)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selected && styles.chipTextSelected,
                        ]}
                      >
                        {role}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Button */}
            <PrimaryButton
              title="Save & Publish"
              onPress={handleSubmit(onSubmit)}
            />
          </>
        }
      />
    </SafeAreaView>
  );
};

export default AddContest;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },

  container: {
    paddingHorizontal: 10,
    paddingBottom: 40,
  },

  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.Bold,
    marginBottom: 12,
  },

  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#eee',
  },

  chipSelected: {
    backgroundColor: themeColors.primary,
  },

  chipText: {
    fontSize: 12,
  },

  chipTextSelected: {
    color: '#fff',
  },
});
