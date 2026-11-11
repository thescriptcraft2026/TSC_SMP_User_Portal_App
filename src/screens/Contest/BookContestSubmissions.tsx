import React, { useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import FastImage from 'react-native-fast-image';

import AuthHeader from '../../components/Header/AuthHeader';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import { LOCAL_BOOK_CONTEST } from '../../data/localBookContest';
import api from '../../../Instance/Instance';

const BookContestSubmissions = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [search, setSearch] = useState('');
  const [liked, setLiked] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [remoteBooks, setRemoteBooks] = useState<any[] | null>(null);
  const contestId = route.params?.contestId || route.params?.id || route.params?.contest?.id;
  const contestTitle = route.params?.contestTitle || LOCAL_BOOK_CONTEST.title;
  const isLocalDemo = contestId === LOCAL_BOOK_CONTEST.id || (!contestId && !route.params?.contestTitle);

  useFocusEffect(React.useCallback(() => {
    let active = true;
    if (isLocalDemo) return undefined;
    setRemoteBooks(null);
    const load = async () => {
      try {
        const response = await api.get(`/contest/book-submission/${contestId}?_=${Date.now()}`);
        const payload = response?.data?.data;
        const bundles = Array.isArray(payload) ? payload : (payload?.submissions || []);
        const books = bundles.flatMap((bundle: any) => (bundle.books || []).map((book: any) => ({ ...book, submissionUser: bundle.user })));
        if (active) setRemoteBooks(books);
      } catch {
        if (active) setRemoteBooks([]);
      }
    };
    load();
    return () => { active = false; };
  }, [contestId, isLocalDemo]));
  const submissions = useMemo(() => {
    const selectedBooks = route.params?.selectedBooks || [];
    const source = isLocalDemo
      ? (selectedBooks.length ? selectedBooks : [
          { id: 'demo-1', title: 'A Story Worth Telling', user: { name: 'You' }, image: '' },
          { id: 'demo-2', title: 'The Last Draft', user: { name: 'Community Author' }, image: '' },
          { id: 'demo-3', title: 'Letters from Home', user: { name: 'Featured Writer' }, image: '' },
        ])
      : (remoteBooks && remoteBooks.length ? remoteBooks : selectedBooks);
    return source.filter((book: any) => String(book.title || '').toLowerCase().includes(search.toLowerCase()));
  }, [route.params?.selectedBooks, remoteBooks, search, isLocalDemo]);

  React.useEffect(() => {
    if (!submissions.length) return;
    setLiked(submissions.filter((book: any) => book.isLiked).map((book: any) => String(book.id)));
    setRatings(Object.fromEntries(submissions.filter((book: any) => book.contest_rating).map((book: any) => [String(book.id), Number(book.contest_rating)])));
  }, [submissions]);

  const averageRating = useMemo(() => {
    const averages = submissions.map((book: any) => Number(book.contest_rating_average || 0)).filter(Boolean);
    if (!averages.length) return '0.0';
    return (averages.reduce((sum: number, value: number) => sum + value, 0) / averages.length).toFixed(1);
  }, [submissions]);

  const getBookImage = (book: any) => {
    const image = book?.image || book?.cover_image || book?.coverImage || book?.book?.image;
    if (!image || typeof image !== 'string') return null;
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    return `https://dvj1oyyzss68w.cloudfront.net/${image.replace(/^\/+/, '')}`;
  };

  const toggleLike = (id: string) => setLiked(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);

  const handleLike = async (id: string) => {
    const isLiked = liked.includes(id);
    try {
      await api.post('/actions/like', { synopsis_id: id, type: isLiked ? 'delete' : 'create' });
      toggleLike(id);
    } catch {
      // Keep the card state unchanged when the action cannot be persisted.
    }
  };

  const handleRating = async (id: string, value: number) => {
    try {
      await api.post(`/actions/rate/${id}`, { rating: value, contest_id: contestId });
      setRatings(current => ({ ...current, [id]: value }));
    } catch {
      // Keep the previous rating when the action cannot be persisted.
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <AuthHeader showBack title="Book Submissions" onBack={() => navigation.goBack()} />
      <FlatList
        data={submissions}
        keyExtractor={(item: any) => String(item.id)}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.hero}>
              <View style={styles.pill}><Ionicons name="book-outline" size={14} color={themeColors.primary} /><Text style={styles.pillText}>BOOK CONTEST</Text></View>
              <Text style={styles.title}>{contestTitle}</Text>
              <Text style={styles.debugId}>Contest ID: {contestId || 'MISSING'}</Text>
              <Text style={styles.subtitle}>Browse entries, support writers, and rate the books you love.</Text>
              <View style={styles.stats}><Text style={styles.stat}><Text style={styles.statStrong}>{submissions.length}</Text> submissions</Text><Text style={styles.stat}><Text style={styles.statStrong}>{averageRating}</Text> average rating</Text></View>
            </View>
            <View style={styles.searchBox}><Ionicons name="search-outline" size={19} color="#8C8C95" /><TextInput value={search} onChangeText={setSearch} placeholder="Search submissions" placeholderTextColor="#777780" style={styles.searchInput} /></View>
            <Text style={styles.sectionTitle}>Community submissions</Text>
          </View>
        }
        renderItem={({ item }: any) => {
          const id = String(item.id);
          const isLiked = liked.includes(id);
          const rating = ratings[id] || 0;
          return (
            <View style={styles.card}>
              <View style={styles.coverColumn}>
                <FastImage
                  source={getBookImage(item) ? { uri: getBookImage(item) as string } : require('../../assets/images/book-1.png')}
                  style={styles.cover}
                  resizeMode={FastImage.resizeMode.cover}
                  onError={() => undefined}
                />
                <Text style={styles.debugImageUrl} numberOfLines={4}>
                  Image URL: {getBookImage(item) || 'MISSING'}
                </Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.author}>{item.user?.name || item.author || 'Author'}</Text>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.action} onPress={() => handleLike(id)}><Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={20} color={isLiked ? '#FF5964' : '#fff'} /><Text style={styles.actionText}>{isLiked ? 'Liked' : 'Like'}</Text></TouchableOpacity>
                  <View style={styles.rating}><Text style={styles.rateLabel}>Rate</Text>{[1, 2, 3, 4, 5].map(value => <TouchableOpacity key={value} onPress={() => handleRating(id, value)}><Ionicons name={value <= rating ? 'star' : 'star-outline'} size={17} color={themeColors.primary} /></TouchableOpacity>)}</View>
                </View>
                <TouchableOpacity style={styles.viewButton} onPress={() => navigation.navigate('BookDetails', { bookId: item.id })}><Text style={styles.viewText}>View Book</Text><Ionicons name="arrow-forward" size={16} color={themeColors.primary} /></TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyTitle}>No submissions found</Text><Text style={styles.emptyText}>Try another search.</Text></View>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: themeColors.black },
  content: { padding: 10, paddingBottom: 32 },
  hero: { backgroundColor: '#1A1A20', borderRadius: 18, padding: 16, marginBottom: 14 },
  pill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#765719', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 5 },
  pillText: { color: themeColors.primary, fontFamily: Fonts.Bold, fontSize: 10, letterSpacing: 0.8 },
  title: { color: '#fff', fontFamily: Fonts.Bold, fontSize: 21, marginTop: 12 },
  debugId: { color: '#8C8C95', fontFamily: Fonts.Regular, fontSize: 11, marginTop: 4 },
  subtitle: { color: '#A8A8B0', fontFamily: Fonts.Regular, fontSize: 13, lineHeight: 19, marginTop: 6 },
  stats: { flexDirection: 'row', gap: 22, marginTop: 16 },
  stat: { color: '#A8A8B0', fontFamily: Fonts.Regular, fontSize: 12 },
  statStrong: { color: '#fff', fontFamily: Fonts.Bold, fontSize: 14 },
  searchBox: { height: 46, borderRadius: 13, backgroundColor: '#1C1C22', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, marginBottom: 16 },
  searchInput: { flex: 1, color: '#fff', fontFamily: Fonts.Regular, fontSize: 15, marginLeft: 9 },
  sectionTitle: { color: '#fff', fontFamily: Fonts.Bold, fontSize: 16, marginBottom: 10 },
  card: { flexDirection: 'row', backgroundColor: '#17171C', borderRadius: 16, padding: 9, marginBottom: 10 },
  cover: { width: 92, height: 125, borderRadius: 10, backgroundColor: '#27272D' },
  coverColumn: { width: 92 },
  debugImageUrl: { color: '#777780', fontFamily: Fonts.Regular, fontSize: 8, lineHeight: 10, marginTop: 4 },
  cardBody: { flex: 1, paddingLeft: 12, paddingVertical: 3 },
  bookTitle: { color: '#fff', fontFamily: Fonts.Bold, fontSize: 16, lineHeight: 20 },
  author: { color: '#9A9AA3', fontFamily: Fonts.Regular, fontSize: 12, marginTop: 5 },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText: { color: '#C5C5CB', fontFamily: Fonts.SemiBold, fontSize: 12 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  rateLabel: { color: '#9A9AA3', fontFamily: Fonts.Regular, fontSize: 11, marginRight: 3 },
  viewButton: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 13 },
  viewText: { color: themeColors.primary, fontFamily: Fonts.Bold, fontSize: 12 },
  empty: { alignItems: 'center', paddingTop: 70 },
  emptyTitle: { color: '#fff', fontFamily: Fonts.Bold, fontSize: 17 },
  emptyText: { color: '#999', fontFamily: Fonts.Regular, fontSize: 13, marginTop: 5 },
});

export default BookContestSubmissions;
