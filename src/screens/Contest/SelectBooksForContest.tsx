import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Ionicons from '@react-native-vector-icons/ionicons';
import FastImage from 'react-native-fast-image';
import AuthHeader from '../../components/Header/AuthHeader';
import BookCard from '../Books/components/cards/BookCard';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import CardSkeleton from '../../components/Cards/CardSkeleton';
import { getAllBooks } from '../../services/bookApi';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import { formatDate } from '../../utils/date';
import { stripHtml } from '../../utils/html';
import { useToast } from '../../components/Toast/ToastProvider';
import api from '../../../Instance/Instance';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 34) / 2;
type ContentType = 'book' | 'synopsis';

const SelectBooksForContest = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { show } = useToast();
  const contest = route.params?.contest || {};
  const user = useSelector((state: any) => state.auth?.user);
  const limit = Number(contest.book_submission_limit || contest.max_books || contest.selection_limit || 3);
  const [books, setBooks] = useState<any[]>([]);
  const [synopses, setSynopses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<Array<{ id: string; content_type: ContentType }>>([]);

  React.useEffect(() => {
    let active = true;
    setLoading(true); setError(false);
    const userId = user?.id || user?.user_id;
    Promise.all([getAllBooks('book', 1, 'recent', search, '', userId, 100), getAllBooks('script', 1, 'recent', search, '', userId, 100)])
      .then(([bookResponse, synopsisResponse]) => {
        if (!active) return;
        setBooks(bookResponse?.data || bookResponse?.books || []);
        setSynopses(synopsisResponse?.data || synopsisResponse?.books || []);
      })
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [search, user]);

  const eligible = useCallback((items: any[]) => items.filter(item => {
    const userId = user?.id || user?.user_id;
    const ownerId = item?.user?.id || item?.user_id || item?.userId;
    const owned = !userId || !ownerId || String(ownerId) === String(userId);
    const status = String(item?.status || '').toLowerCase();
    return owned && (!status || status === 'publish' || status === 'published');
  }), [user]);
  const eligibleBooks = useMemo(() => eligible(books), [books, eligible]);
  const eligibleSynopses = useMemo(() => eligible(synopses), [synopses, eligible]);
  const isSelected = (item: any, type: ContentType) => selectedItems.some(selected => selected.id === String(item.id) && selected.content_type === type);
  const getImage = (item: any) => {
    const image = item?.image || item?.cover_image || item?.coverImage;
    if (!image || typeof image !== 'string') return null;
    return /^https?:\/\//i.test(image) ? image : `https://dvj1oyyzss68w.cloudfront.net/${image.replace(/^\/+/, '')}`;
  };

  const toggleItem = (item: any, content_type: ContentType) => {
    const id = String(item?.id || '');
    if (!id) return;
    if (isSelected(item, content_type)) {
      setSelectedItems(current => current.filter(selected => !(selected.id === id && selected.content_type === content_type)));
      return;
    }
    if (selectedItems.length >= limit) {
      show({ type: 'error', title: `You can select up to ${limit} items.` });
      return;
    }
    setSelectedItems(current => [...current, { id, content_type }]);
  };

  const submitItems = async () => {
    if (!selectedItems.length) return;
    try {
      const response = await api.post(`/contest/book-submission/${contest.id}`, { items: selectedItems });
      const submission = response?.data?.data;
      const selectedBooks = submission?.books || eligibleBooks.filter(item => selectedItems.some(selected => selected.id === String(item.id) && selected.content_type === 'book'));
      const selectedSynopses = submission?.synopses || eligibleSynopses.filter(item => selectedItems.some(selected => selected.id === String(item.id) && selected.content_type === 'synopsis'));
      navigation.replace('SuccessScreen', { contestId: contest.id, title: contest.title, bookContest: true, selectedBooks, selectedSynopses, selectedItems, participantId: submission?.id, shareToken: submission?.share_token });
    } catch (submitError: any) {
      show({
        type: 'error',
        title:
          submitError?.response?.data?.code === 'DUPLICATE_SUBMISSION'
            ? 'This same selection was already submitted.'
            : submitError?.response?.data?.message || 'Unable to submit items. Please try again.',
      });
    }
  };

  const renderBook = ({ item }: any) => {
    const selected = isSelected(item, 'book');
    return <View style={[styles.bookWrap, selected && styles.selectedBook]}><BookCard image={item.image} height={255} width={CARD_WIDTH} ribbonText={item.genre?.name || 'BOOK'} title={item.title} author={item.user?.name || item.author} rating={item.avg_rating} likes={item.likes_count} views={item.views} onPress={() => toggleItem(item, 'book')} /><View style={[styles.check, selected && styles.checkActive]}><Ionicons name={selected ? 'checkmark' : 'add'} size={18} color={selected ? '#09090d' : '#fff'} /></View></View>;
  };

  return <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
    <AuthHeader showBack title="Select Books & Synopses" onBack={() => navigation.goBack()} />
    <FlatList data={eligibleBooks} numColumns={2} keyExtractor={item => String(item.id)} showsVerticalScrollIndicator={false} columnWrapperStyle={styles.row} contentContainerStyle={styles.content} renderItem={renderBook}
      ListHeaderComponent={<View><View style={styles.intro}><View style={styles.typePill}><Ionicons name="book-outline" size={15} color={themeColors.primary} /><Text style={styles.typeText}>BOOK CONTEST</Text></View><Text style={styles.title} numberOfLines={2}>{contest.title || 'Book Contest'}</Text><Text style={styles.meta}>Submit up to {limit} books or synopses · Ends {formatDate(contest.end_date)}</Text></View><View style={styles.searchBox}><Ionicons name="search-outline" size={19} color="#8C8C95" /><TextInput value={search} onChangeText={setSearch} placeholder="Search books and synopses" placeholderTextColor="#777780" style={styles.searchInput} /></View><View style={styles.selectionBar}><Text style={styles.selectionText}>{selectedItems.length} of {limit} selected</Text><Text style={styles.hint}>{selectedItems.length === limit ? 'Limit reached' : 'Choose your strongest work'}</Text></View><Text style={styles.sectionTitle}>Books</Text></View>}
      ListEmptyComponent={loading ? <View style={styles.empty}><CardSkeleton width={CARD_WIDTH} height={255} /><ActivityIndicator color={themeColors.primary} /></View> : <View style={styles.empty}><Ionicons name={error ? 'alert-circle-outline' : 'library-outline'} size={42} color={themeColors.primary} /><Text style={styles.emptyTitle}>{error ? 'Unable to load content' : 'No eligible books found'}</Text><Text style={styles.emptyText}>{error ? 'Please try again in a moment.' : 'Published books you own will appear here.'}</Text></View>}
      ListFooterComponent={<View><Text style={styles.sectionTitle}>Synopses</Text>{eligibleSynopses.length ? eligibleSynopses.map(item => { const selected = isSelected(item, 'synopsis'); const image = getImage(item); return <View key={String(item.id)} style={[styles.synopsisRow, selected && styles.selectedBook]}><FastImage source={image ? { uri: image } : require('../../assets/images/book-1.png')} style={styles.synopsisImage} resizeMode={FastImage.resizeMode.cover} /><View style={styles.synopsisCopy}><Text style={styles.synopsisTitle} numberOfLines={2}>{item.title}</Text><Text style={styles.synopsisText} numberOfLines={4}>{stripHtml(item.story || item.synopsis) || 'No synopsis text available.'}</Text></View><TouchableOpacity style={[styles.check, selected && styles.checkActive]} onPress={() => toggleItem(item, 'synopsis')}><Ionicons name={selected ? 'checkmark' : 'add'} size={18} color={selected ? '#09090d' : '#fff'} /></TouchableOpacity></View>; }) : <Text style={styles.emptyText}>No eligible synopses found.</Text>}</View>}
    />
    <View style={styles.footer}><PrimaryButton title={`Submit ${selectedItems.length ? `${selectedItems.length} Item${selectedItems.length > 1 ? 's' : ''}` : 'Items'}`} onPress={() => submitItems()} disabled={!selectedItems.length} marginTop={0} /></View>
  </SafeAreaView>;
};

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: themeColors.black }, content: { paddingHorizontal: 10, paddingBottom: 100 }, intro: { paddingHorizontal: 4, paddingTop: 8, paddingBottom: 16 }, typePill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#765719', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 }, typeText: { color: themeColors.primary, fontFamily: Fonts.Bold, fontSize: 11, letterSpacing: 1 }, title: { color: '#fff', fontFamily: Fonts.Bold, fontSize: 22, marginTop: 12 }, meta: { color: '#A8A8B0', fontFamily: Fonts.Regular, fontSize: 13, marginTop: 6 }, searchBox: { height: 46, borderRadius: 13, backgroundColor: '#1C1C22', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, marginBottom: 14 }, searchInput: { flex: 1, color: '#fff', fontFamily: Fonts.Regular, fontSize: 15, marginLeft: 9 }, selectionBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4, marginBottom: 4 }, selectionText: { color: '#fff', fontFamily: Fonts.Bold, fontSize: 15 }, hint: { color: '#8C8C95', fontFamily: Fonts.Regular, fontSize: 12 }, sectionTitle: { color: '#fff', fontFamily: Fonts.Bold, fontSize: 17, marginTop: 14, marginBottom: 10 }, row: { justifyContent: 'space-between', marginBottom: 12 }, bookWrap: { width: CARD_WIDTH, borderRadius: 14, position: 'relative', borderWidth: 2, borderColor: 'transparent' }, selectedBook: { borderColor: themeColors.primary }, check: { position: 'absolute', top: 12, right: 10, width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(9,9,13,0.75)', borderWidth: 1, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' }, checkActive: { backgroundColor: themeColors.primary, borderColor: themeColors.primary }, synopsisRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#17171C', borderRadius: 14, padding: 10, marginBottom: 10, borderWidth: 2, borderColor: 'transparent' }, synopsisImage: { width: 68, height: 88, borderRadius: 8, backgroundColor: '#27272D' }, synopsisCopy: { flex: 1, paddingHorizontal: 10 }, synopsisTitle: { color: '#fff', fontFamily: Fonts.Bold, fontSize: 15 }, synopsisText: { color: '#A8A8B0', fontFamily: Fonts.Regular, fontSize: 13, lineHeight: 18, marginTop: 6 }, empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 50, gap: 10 }, emptyTitle: { color: '#fff', fontFamily: Fonts.Bold, fontSize: 17, marginTop: 4 }, emptyText: { color: '#96969E', fontFamily: Fonts.Regular, fontSize: 13, textAlign: 'center', maxWidth: 280 }, footer: { position: 'absolute', left: 10, right: 10, bottom: 12, padding: 8, borderRadius: 16, backgroundColor: 'rgba(9,9,13,0.92)' } });
export default SelectBooksForContest;
