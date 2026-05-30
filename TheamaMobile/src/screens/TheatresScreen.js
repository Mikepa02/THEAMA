import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, ScrollView, Modal, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const CARD_GRADIENTS = [
  { bg: '#E94560', emoji: '🎭', label: 'Δραματικό' },
  { bg: '#0891B2', emoji: '🎪', label: 'Μιούζικαλ' },
  { bg: '#F59E0B', emoji: '✨', label: 'Κλασικό' },
  { bg: '#7C3AED', emoji: '🎨', label: 'Σύγχρονο' },
  { bg: '#02C39A', emoji: '🎬', label: 'Performance' },
];

export default function TheatresScreen({ navigation }) {
  const [theatres, setTheatres] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const { user, isGuest, logout } = useAuth();

  useFocusEffect(useCallback(() => {
    loadTheatres();
  }, []));

  async function loadTheatres() {
    try {
      const response = await api.get('/theatres');
      setTheatres(response.data);
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setLoading(false);
    }
  }

  const filtered = theatres.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.location.toLowerCase().includes(search.toLowerCase())
  );

  const totalShows = theatres.reduce((s, t) => s + (t.show_count || 0), 0);
  const displayName = isGuest ? 'Επισκέπτη' : user?.name;
  const displayLetter = isGuest ? '?' : user?.name?.[0]?.toUpperCase();

  function goToProfile() {
    setMenuVisible(false);
    if (isGuest) {
      logout();
    } else {
      navigation.getParent()?.navigate('Προφίλ');
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.dark }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />

          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Καλώς ήρθες 👋</Text>
              <Text style={styles.userName}>{displayName}</Text>
            </View>
            <TouchableOpacity onPress={() => setMenuVisible(true)} activeOpacity={0.7}>
              <View style={[styles.avatar, isGuest && { backgroundColor: colors.teal }]}>
                <Text style={styles.avatarText}>{displayLetter}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {isGuest && (
            <View style={styles.guestBanner}>
              <Text style={styles.guestBannerIcon}>👤</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.guestBannerTitle}>Είσοδος ως Επισκέπτης</Text>
                <Text style={styles.guestBannerSub}>Συνδέσου για να κάνεις κράτηση</Text>
              </View>
              <TouchableOpacity onPress={logout} style={styles.guestBtn}>
                <Text style={styles.guestBtnText}>Σύνδεση</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.heroTitle}>Βρες τη{"\n"}θεατρική σου εμπειρία</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{theatres.length}</Text>
              <Text style={styles.statLbl}>Θέατρα</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{totalShows}</Text>
              <Text style={styles.statLbl}>Παραστάσεις</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>24/7</Text>
              <Text style={styles.statLbl}>Κρατήσεις</Text>
            </View>
          </View>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.search}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Αναζήτηση θεάτρου ή παράστασης..."
              placeholderTextColor="#6B7280"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Διαθέσιμα Θέατρα</Text>
          <Text style={styles.sectionCount}>{filtered.length} θέατρα</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 60 }} size="large" />
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>Δεν βρέθηκαν αποτελέσματα</Text>
          </View>
        ) : (
          filtered.map((theatre, idx) => {
            const cardStyle = CARD_GRADIENTS[idx % CARD_GRADIENTS.length];
            return (
              <TouchableOpacity
                key={theatre.theatre_id}
                style={styles.theatreCard}
                onPress={() => navigation.navigate('Shows', { theatreId: theatre.theatre_id, theatreName: theatre.name })}
                activeOpacity={0.85}
              >
                <View style={[styles.theatreImg, { backgroundColor: cardStyle.bg }]}>
                  <Text style={styles.theatreEmoji}>{cardStyle.emoji}</Text>
                  <View style={styles.imgOverlay}>
                    <Text style={styles.imgLabel}>{cardStyle.label}</Text>
                  </View>
                </View>
                <View style={styles.theatreInfo}>
                  <View>
                    <Text style={styles.theatreName} numberOfLines={1}>{theatre.name}</Text>
                    <Text style={styles.theatreLoc}>📍 {theatre.location}</Text>
                  </View>
                  <View style={styles.theatreFoot}>
                    <View style={styles.tagAccent}>
                      <Text style={styles.tagAccentText}>{theatre.show_count} παραστάσεις</Text>
                    </View>
                    <View style={styles.arrowBox}>
                      <Text style={styles.arrow}>→</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuCard}>
            <View style={styles.menuHeader}>
              <View style={[styles.menuAvatar, isGuest && { backgroundColor: colors.teal }]}>
                <Text style={styles.menuAvatarText}>{displayLetter}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuName}>{displayName}</Text>
                <Text style={styles.menuEmail}>{isGuest ? 'Μη συνδεδεμένος' : user?.email}</Text>
              </View>
            </View>

            <View style={styles.menuDivider} />

            {!isGuest && (
              <TouchableOpacity style={styles.menuItem} onPress={goToProfile}>
                <Text style={styles.menuItemIcon}>👤</Text>
                <Text style={styles.menuItemText}>Το Προφίλ μου</Text>
              </TouchableOpacity>
            )}

            {isGuest ? (
              <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); logout(); }}>
                <Text style={styles.menuItemIcon}>🔑</Text>
                <Text style={[styles.menuItemText, { color: colors.accent, fontWeight: '700' }]}>Σύνδεση</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); logout(); }}>
                <Text style={styles.menuItemIcon}>🚪</Text>
                <Text style={[styles.menuItemText, { color: colors.accent, fontWeight: '700' }]}>Αποσύνδεση</Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingTop: 50, paddingHorizontal: 24, paddingBottom: 28, overflow: 'hidden', position: 'relative' },
  heroCircle1: { position: 'absolute', top: -50, right: -80, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(233,69,96,0.1)' },
  heroCircle2: { position: 'absolute', top: 40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(8,145,178,0.08)' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  greeting: { color: colors.muted, fontSize: 14 },
  userName: { color: colors.white, fontSize: 22, fontWeight: '700', marginTop: 2 },
  avatar: { width: 44, height: 44, backgroundColor: colors.accent, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: 17 },
  guestBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(8,145,178,0.15)', borderWidth: 1, borderColor: 'rgba(8,145,178,0.3)', borderRadius: 14, padding: 12, marginBottom: 16, gap: 12 },
  guestBannerIcon: { fontSize: 24 },
  guestBannerTitle: { color: colors.white, fontSize: 13, fontWeight: '700' },
  guestBannerSub: { color: colors.muted, fontSize: 11, marginTop: 2 },
  guestBtn: { backgroundColor: colors.teal, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  guestBtnText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  heroTitle: { color: colors.white, fontSize: 26, fontWeight: '800', letterSpacing: -0.5, lineHeight: 34, marginBottom: 22 },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(30,42,69,0.6)', borderRadius: 18, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)' },
  statNum: { color: colors.accent, fontSize: 20, fontWeight: '800' },
  statLbl: { color: colors.muted, fontSize: 11, marginTop: 2 },
  searchSection: { paddingHorizontal: 24, marginTop: -8 },
  search: { flexDirection: 'row', backgroundColor: '#1A1A2E', borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1.5, borderColor: colors.border, gap: 10 },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, color: colors.white, fontSize: 14 },
  clearIcon: { color: colors.muted, fontSize: 14, padding: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginTop: 28, marginBottom: 14 },
  sectionTitle: { color: colors.white, fontSize: 18, fontWeight: '700' },
  sectionCount: { color: colors.muted, fontSize: 12 },
  empty: { alignItems: 'center', padding: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12, opacity: 0.5 },
  emptyText: { color: colors.muted, fontSize: 14 },
  theatreCard: { backgroundColor: '#1A1A2E', borderRadius: 20, marginHorizontal: 24, marginBottom: 14, overflow: 'hidden', flexDirection: 'row', borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  theatreImg: { width: 110, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  theatreEmoji: { fontSize: 42 },
  imgOverlay: { position: 'absolute', bottom: 8, left: 0, right: 0, alignItems: 'center' },
  imgLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 9, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  theatreInfo: { flex: 1, padding: 16, justifyContent: 'space-between' },
  theatreName: { color: colors.white, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  theatreLoc: { color: colors.muted, fontSize: 12 },
  theatreFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  tagAccent: { backgroundColor: 'rgba(233,69,96,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  tagAccentText: { color: colors.accent, fontSize: 11, fontWeight: '600' },
  arrowBox: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(233,69,96,0.15)', alignItems: 'center', justifyContent: 'center' },
  arrow: { color: colors.accent, fontSize: 14, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 90, paddingRight: 18 },
  menuCard: { backgroundColor: '#1E2A45', borderRadius: 16, padding: 8, minWidth: 240, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  menuHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  menuAvatar: { width: 40, height: 40, backgroundColor: colors.accent, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  menuAvatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  menuName: { color: '#fff', fontSize: 14, fontWeight: '700' },
  menuEmail: { color: colors.muted, fontSize: 12, marginTop: 2 },
  menuDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12, borderRadius: 10 },
  menuItemIcon: { fontSize: 16 },
  menuItemText: { color: '#fff', fontSize: 14, fontWeight: '500' },
});
