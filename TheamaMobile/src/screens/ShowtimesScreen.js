import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import api from '../api/client';

export default function ShowtimesScreen({ navigation, route }) {
  const { showId, showTitle, theatreName } = route.params;
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const response = await api.get('/showtimes', { params: { showId } });
      setShowtimes(response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    const days = ['Κυρ', 'Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ'];
    const months = ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μαϊ', 'Ιουν', 'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ'];
    return {
      day: days[d.getDay()],
      date: d.getDate().toString().padStart(2,'0'),
      month: months[d.getMonth()],
      time: `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`,
    };
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.sub}>{theatreName}</Text>
          <Text style={styles.title}>{showTitle}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>📅</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.infoTitle}>Επίλεξε ημερομηνία</Text>
          <Text style={styles.infoSub}>{showtimes.length} διαθέσιμες παραστάσεις</Text>
        </View>
      </View>

      {loading ? <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} size="large" /> :
        showtimes.map(st => {
          const fmt = formatDate(st.date_time);
          return (
            <TouchableOpacity
              key={st.showtime_id}
              style={styles.showtimeCard}
              onPress={() => navigation.navigate('Seats', { showtimeId: st.showtime_id, showTitle, theatreName, price: st.price, date: st.date_time, room: st.room })}
              activeOpacity={0.85}
            >
              <View style={styles.dateBox}>
                <Text style={styles.dayText}>{fmt.day}</Text>
                <Text style={styles.dateText}>{fmt.date}</Text>
                <Text style={styles.monthText}>{fmt.month}</Text>
              </View>
              <View style={styles.showtimeInfo}>
                <View style={styles.timeRow}>
                  <Text style={styles.timeIcon}>🕐</Text>
                  <Text style={styles.timeText}>{fmt.time}</Text>
                </View>
                <View style={styles.roomRow}>
                  <Text style={styles.roomIcon}>🏛</Text>
                  <Text style={styles.roomText}>Αίθουσα {st.room}</Text>
                </View>
              </View>
              <View style={styles.priceBox}>
                <Text style={styles.priceText}>€{st.price}</Text>
                <Text style={styles.priceLabel}>/ θέση</Text>
              </View>
            </TouchableOpacity>
          );
        })
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
  title: { color: colors.white, fontSize: 20, fontWeight: '700' },
  infoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(8,145,178,0.1)', borderRadius: 16, marginHorizontal: 24, marginTop: 16, marginBottom: 20, padding: 16, gap: 14, borderWidth: 1, borderColor: 'rgba(8,145,178,0.2)' },
  infoIcon: { fontSize: 28 },
  infoTitle: { color: colors.white, fontSize: 14, fontWeight: '700' },
  infoSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  showtimeCard: { backgroundColor: '#1A1A2E', borderRadius: 18, marginHorizontal: 24, marginBottom: 12, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  dateBox: { backgroundColor: 'rgba(233,69,96,0.15)', borderRadius: 14, padding: 12, alignItems: 'center', minWidth: 64, borderWidth: 1, borderColor: 'rgba(233,69,96,0.25)' },
  dayText: { color: colors.accent, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  dateText: { color: colors.accent, fontSize: 22, fontWeight: '800', marginTop: 2 },
  monthText: { color: colors.accent, fontSize: 10, fontWeight: '600', marginTop: 1 },
  showtimeInfo: { flex: 1, marginLeft: 14 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  timeIcon: { fontSize: 14 },
  timeText: { color: colors.white, fontSize: 18, fontWeight: '700' },
  roomRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  roomIcon: { fontSize: 12 },
  roomText: { color: colors.muted, fontSize: 12 },
  priceBox: { alignItems: 'flex-end' },
  priceText: { color: colors.accent, fontSize: 20, fontWeight: '800' },
  priceLabel: { color: colors.muted, fontSize: 10 },
});
