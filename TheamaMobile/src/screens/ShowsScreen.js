import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import api from '../api/client';

export default function ShowsScreen({ navigation, route }) {
  const { theatreId, theatreName } = route.params;
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadShows(); }, []);

  async function loadShows() {
    try {
      const response = await api.get('/shows', { params: { theatreId } });
      setShows(response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.sub}>{theatreName}</Text>
          <Text style={styles.title}>Παραστάσεις</Text>
        </View>
      </View>

      <View style={styles.bannerWrap}>
        <View style={styles.banner}>
          <Text style={styles.bannerIcon}>🎭</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>{shows.length} διαθέσιμες παραστάσεις</Text>
            <Text style={styles.bannerSub}>Επίλεξε αυτή που σου ταιριάζει</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>ΕΠΙΛΕΞΕ ΠΑΡΑΣΤΑΣΗ</Text>

      {loading ? <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} size="large" /> :
        shows.map((show, idx) => (
          <TouchableOpacity
            key={show.show_id}
            style={styles.showCard}
            onPress={() => navigation.navigate('Showtimes', { showId: show.show_id, showTitle: show.title, theatreName })}
            activeOpacity={0.85}
          >
            <View style={styles.showLeft}>
              <Text style={styles.showNum}>{(idx + 1).toString().padStart(2, '0')}</Text>
            </View>
            <View style={styles.showInfo}>
              <Text style={styles.showTitle}>{show.title}</Text>
              <Text style={styles.showDesc} numberOfLines={2}>{show.description}</Text>
              <View style={styles.showMeta}>
                <View style={styles.metaBadge}>
                  <Text style={styles.metaIcon}>⏱</Text>
                  <Text style={styles.metaText}>{show.duration} λεπτά</Text>
                </View>
                {show.age_rating && (
                  <View style={styles.metaBadge}>
                    <Text style={styles.metaIcon}>👤</Text>
                    <Text style={styles.metaText}>{show.age_rating}</Text>
                  </View>
                )}
              </View>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))
      }
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  header: { flexDirection: 'row', paddingHorizontal: 24, paddingTop: 50, paddingBottom: 8, alignItems: 'center', gap: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(233,69,96,0.15)', alignItems: 'center', justifyContent: 'center' },
  back: { color: colors.accent, fontSize: 24, fontWeight: '700' },
  sub: { color: colors.muted, fontSize: 12 },
  title: { color: colors.white, fontSize: 22, fontWeight: '800' },
  bannerWrap: { paddingHorizontal: 24, marginTop: 16, marginBottom: 8 },
  banner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(233,69,96,0.1)', borderRadius: 16, padding: 16, gap: 14, borderWidth: 1, borderColor: 'rgba(233,69,96,0.2)' },
  bannerIcon: { fontSize: 28 },
  bannerTitle: { color: colors.white, fontSize: 14, fontWeight: '700' },
  bannerSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  sectionTitle: { color: '#9CA3AF', fontSize: 11, fontWeight: '700', letterSpacing: 1, paddingHorizontal: 24, marginTop: 20, marginBottom: 14 },
  showCard: { backgroundColor: '#1A1A2E', borderRadius: 18, marginHorizontal: 24, marginBottom: 12, padding: 18, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  showLeft: { width: 50, height: 50, borderRadius: 12, backgroundColor: 'rgba(233,69,96,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  showNum: { color: colors.accent, fontSize: 18, fontWeight: '800' },
  showInfo: { flex: 1 },
  showTitle: { color: colors.white, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  showDesc: { color: colors.muted, fontSize: 12, marginBottom: 10, lineHeight: 17 },
  showMeta: { flexDirection: 'row', gap: 8 },
  metaBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F0F1A', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  metaIcon: { fontSize: 11 },
  metaText: { color: '#9CA3AF', fontSize: 11, fontWeight: '600' },
  arrow: { color: colors.accent, fontSize: 28, marginLeft: 10 },
});
