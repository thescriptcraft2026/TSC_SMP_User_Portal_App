import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from '@react-native-vector-icons/ionicons';

import AuthHeader from '../../components/Header/AuthHeader';
import BookCard from '../Books/components/cards/BookCard';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import CardSkeleton from '../../components/Cards/CardSkeleton';
import { getBooks } from '../../redux/slices/bookSlice';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import { formatDate } from '../../utils/date';
import { useToast } from '../../components/Toast/ToastProvider';
import api from '../../../Instance/Instance';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 34) / 2;

const SelectBooksForContest = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch<any>();
  const { show } = useToast();
  const contest = route.params?.contest || {};
  const user = useSelector((state: any) => state.auth?.user);
  const { books = [], loading, error } = useSelector((state: any) => state.book);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const limit = Number(
    contest.book_submission_limit || contest.max_books || contest.selection_limit || 3,
  );

  useFocusEffect(
    useCallback(() => {
      dispatch(getBooks({ page: 1, sort_by: 'recent', type: 'book', search }));
    }, [dispatch, search]),
  );

  const eligibleBooks = useMemo(() => {
    const userId = user?.id || user?.user_id;
    return (books || []).filter((book: any) => {
      const ownerId = book?.user?.id || book?.user_id || book?.userId;
      const ownedByUser = !userId || !ownerId || String(ownerId) === String(userId);
      const status = String(book?.status || '').toLowerCase();
      const published = !status || status === 'publish' || status === 'published';
      const matchesSearch = !search.trim() || String(book?.title || '').toLowerCase().includes(search.trim().toLowerCase());
      return ownedByUser && published && matchesSearch;
    });
  }, [books, search, user]);

  const toggleBook = (book: any) => {
    const id = String(book?.id);
    if (!id) return;
    if (selectedIds.includes(id)) {
      setSelectedIds(current => current.filter(item => item !== id));
      return;
    }
    if (selectedIds.length >= limit) {
      show({ type: 'error', title: `You can select up to ${limit} books.` });
      return;
    }
    setSelectedIds(current => [...current, id]);
  };

  const submitBooks = async () => {
    if (!selectedIds.length) return;
    try {
      const response = await api.post(`/contest/book-submission/${contest.id}`, { book_ids: selectedIds });
      const submission = response?.data?.data;
      navigation.replace('SuccessScreen', {
        contestId: contest.id,
        title: contest.title,
        bookContest: true,
        selectedBooks: submission?.books || eligibleBooks.filter((book: any) => selectedIds.includes(String(book.id))),
        participantId: submission?.id,
        shareToken: submission?.share_token,
      });
    } catch (error: any) {
      show({ type: 'error', title: error?.response?.data?.message || 'Unable to submit books. Please try again.' });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <AuthHeader showBack title="Select Books" onBack={() => navigation.goBack()} />
      <FlatList
        data={eligibleBooks}
        numColumns={2}
        keyExtractor={(item: any) => String(item.id)}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <View style={styles.intro}>
              <View style={styles.typePill}>
                <Ionicons name="book-outline" size={15} color={themeColors.primary} />
                <Text style={styles.typeText}>BOOK CONTEST</Text>
              </View>
              <Text style={styles.title} numberOfLines={2}>{contest.title || 'Book Contest'}</Text>
              <Text style={styles.meta}>Submit up to {limit} published books · Ends {formatDate(contest.end_date)}</Text>
            </View>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={19} color="#8C8C95" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search your books"
                placeholderTextColor="#777780"
                style={styles.searchInput}
              />
              {!!search && <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color="#777780" /></TouchableOpacity>}
            </View>
            <View style={styles.selectionBar}>
              <Text style={styles.selectionText}>{selectedIds.length} of {limit} selected</Text>
              <Text style={styles.hint}>{selectedIds.length === limit ? 'Limit reached' : 'Choose your strongest work'}</Text>
            </View>
          </View>
        }
        renderItem={({ item }: any) => {
          const selected = selectedIds.includes(String(item.id));
          return (
            <View style={[styles.bookWrap, selected && styles.selectedBook]}>
              <BookCard
                image={item.image}
                height={255}
                width={CARD_WIDTH}
                ribbonText={item.genre?.name || 'BOOK'}
                title={item.title}
                author={item.user?.name || item.author}
                rating={item.avg_rating}
                likes={item.likes_count}
                views={item.views}
                onPress={() => toggleBook(item)}
              />
              <View style={[styles.check, selected && styles.checkActive]}>
                <Ionicons name={selected ? 'checkmark' : 'add'} size={18} color={selected ? '#09090d' : '#fff'} />
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          loading ? <View style={styles.empty}><CardSkeleton width={CARD_WIDTH} height={255} /><ActivityIndicator color={themeColors.primary} /></View> :
          <View style={styles.empty}><Ionicons name={error ? 'alert-circle-outline' : 'library-outline'} size={42} color={themeColors.primary} /><Text style={styles.emptyTitle}>{error ? 'Unable to load books' : 'No eligible books found'}</Text><Text style={styles.emptyText}>{error ? 'Please try again in a moment.' : 'Published books you own will appear here.'}</Text></View>
        }
      />
      <View style={styles.footer}>
        <PrimaryButton title={`Submit ${selectedIds.length ? `${selectedIds.length} Book${selectedIds.length > 1 ? 's' : ''}` : 'Books'}`} onPress={submitBooks} disabled={!selectedIds.length} marginTop={0} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: themeColors.black },
  content: { paddingHorizontal: 10, paddingBottom: 100 },
  intro: { paddingHorizontal: 4, paddingTop: 8, paddingBottom: 16 },
  typePill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#765719', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  typeText: { color: themeColors.primary, fontFamily: Fonts.Bold, fontSize: 11, letterSpacing: 1 },
  title: { color: '#fff', fontFamily: Fonts.Bold, fontSize: 22, marginTop: 12 },
  meta: { color: '#A8A8B0', fontFamily: Fonts.Regular, fontSize: 13, marginTop: 6 },
  searchBox: { height: 46, borderRadius: 13, backgroundColor: '#1C1C22', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, marginBottom: 14 },
  searchInput: { flex: 1, color: '#fff', fontFamily: Fonts.Regular, fontSize: 15, marginLeft: 9 },
  selectionBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4, marginBottom: 12 },
  selectionText: { color: '#fff', fontFamily: Fonts.Bold, fontSize: 15 },
  hint: { color: '#8C8C95', fontFamily: Fonts.Regular, fontSize: 12 },
  row: { justifyContent: 'space-between', marginBottom: 12 },
  bookWrap: { width: CARD_WIDTH, borderRadius: 14, position: 'relative', borderWidth: 2, borderColor: 'transparent' },
  selectedBook: { borderColor: themeColors.primary },
  check: { position: 'absolute', top: 12, right: 10, width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(9,9,13,0.75)', borderWidth: 1, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  checkActive: { backgroundColor: themeColors.primary, borderColor: themeColors.primary },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 70, gap: 10 },
  emptyTitle: { color: '#fff', fontFamily: Fonts.Bold, fontSize: 17, marginTop: 4 },
  emptyText: { color: '#96969E', fontFamily: Fonts.Regular, fontSize: 13, textAlign: 'center', maxWidth: 260 },
  footer: { position: 'absolute', left: 10, right: 10, bottom: 12, padding: 8, borderRadius: 16, backgroundColor: 'rgba(9,9,13,0.92)' },
});

export default SelectBooksForContest;
