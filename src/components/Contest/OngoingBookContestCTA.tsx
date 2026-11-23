import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { getAllContestApi } from '../../services/contestApi';
import { getContestStatus } from '../../utils/contest';
import { themeColors } from '../../theme/colors';

const isBookContest = (contest: any) => {
  const values = [
    contest?.contest_type,
    contest?.contestType,
    contest?.contest_kind,
    contest?.content_type,
    contest?.contest_content_type,
    contest?.type,
    contest?.submission_type,
  ];
  return contest?.is_book_contest === true || contest?.is_book_contest === 1 ||
    values.some(value => String(value ?? '').toLowerCase().includes('book'));
};

const extractContests = (response: any) => {
  const data = response?.data ?? response;
  if (Array.isArray(data)) return data;
  return data?.contests ?? data?.rows ?? data?.results ?? [];
};

const OngoingBookContestCTA = () => {
  const navigation = useNavigation<any>();
  const pulse = useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let mounted = true;
    getAllContestApi(1, 'ongoing', '', '')
      .then(response => {
        if (!mounted) return;
        setVisible(extractContests(response).some((contest: any) =>
          isBookContest(contest) && getContestStatus(contest?.start_date, contest?.end_date) === 'ongoing',
        ));
      })
      .catch(() => {
        if (mounted) setVisible(false);
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!visible) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse, visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.015] }) }] }]}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Book contest live. Participate now"
        activeOpacity={0.85}
        style={styles.button}
        onPress={() => navigation.navigate('AllContest', { initialTab: 'Ongoing' })}
      >
        <Ionicons name="flash" size={20} color={themeColors.black} />
        <Text style={styles.text}>Synopses Contest Live Now</Text>
        <Ionicons name="arrow-forward-circle" size={22} color={themeColors.black} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 10,
    marginTop: 8,
    marginBottom: 4,
    shadowColor: themeColors.primary,
    shadowOpacity: 0.65,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 8,
  },
  button: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: themeColors.primary,
  },
  text: {
    flex: 1,
    marginHorizontal: 10,
    color: themeColors.black,
    fontSize: 14,
    fontWeight: '800',
  },
});

export default OngoingBookContestCTA;
