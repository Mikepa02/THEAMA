import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import AuthPromptModal from '../components/AuthPromptModal';

export default function SeatsScreen({ navigation, route }) {
  const { showtimeId, showTitle, theatreName, price, date, room } = route.params;
  const [seats, setSeats] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const { isGuest, user } = useAuth();
  const pollingRef = useRef(null);

  useEffect(() => {
    loadSeats();
    // Real-time updates: poll every 3 seconds
    pollingRef.current = setInterval(loadSeats, 3000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  async function loadSeats() {
    try {
      const response = await api.get('/seats', { params: { showtimeId } });
      setSeats(response.data);
    } catch (e) {
      console.error('Error loading seats:', e);
    } finally {
      setLoading(false);
    }
  }

  function toggleSeat(seat) {
    if (seat.status === 'booked') return;
    if (selectedIds.includes(seat.seat_id)) {
      setSelectedIds(selectedIds.filter(id => id !== seat.seat_id));
    } else {
      setSelectedIds([...selectedIds, seat.seat_id]);
    }
  }

  async function handleBook() {
    if (isGuest || !user) {
      setShowAuthPrompt(true);
      return;
    }
    if (selectedIds.length === 0) {
      Alert.alert('Επιλέξτε θέση', 'Πρέπει να επιλέξετε τουλάχιστον μία θέση');
      return;
    }

    setBooking(true);
    if (pollingRef.current) clearInterval(pollingRef.current);

    try {
      const bookedNumbers = [];
      for (const seatId of selectedIds) {
        await api.post('/reservations', { seat_id: seatId });
        const seat = seats.find(s => s.seat_id === seatId);
        if (seat) bookedNumbers.push(seat.seat_number);
      }
      navigation.replace('Confirmation', {
        seats: bookedNumbers,
        showTitle,
        theatreName,
        date,
        room,
        total: selectedIds.length * parseFloat(price),
      });
    } catch (e) {
      const msg = e.response?.data?.error || 'Η θέση μόλις κλείστηκε από άλλον χρήστη';
      Alert.alert('Αποτυχία κράτησης', msg);
      setSelectedIds([]);
      await loadSeats();
      pollingRef.current = setInterval(loadSeats, 3000);
    } finally {
      setBooking(false);
    }
  }

  // Organize seats by row letter (A, B, C, D)
  const rowsMap = {};
  seats.forEach(seat => {
    const row = seat.seat_number.charAt(0);
    if (!rowsMap[row]) rowsMap[row] = [];
    rowsMap[row].push(seat);
  });
  Object.keys(rowsMap).forEach(r => {
    rowsMap[r].sort((a, b) => parseInt(a.seat_number.slice(1)) - parseInt(b.seat_number.slice(1)));
  });
  const sortedRowKeys = Object.keys(rowsMap).sort();

  const formattedDate = date ? new Date(date).toLocaleString('el-GR', { dateStyle: 'medium', timeStyle: 'short' }) : '';
  const totalPrice = (selectedIds.length * parseFloat(price)).toFixed(2);
  const availableCount = seats.filter(s => s.status === 'available').length;
  const bookedCount = seats.filter(s => s.status === 'booked').length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.dark }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 180 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.back}>‹</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.sub}>{theatreName}</Text>
            <Text style={styles.title}>Επιλογή Θέσης</Text>
          </View>
        </View>

        <View style={styles.showInfo}>
          <View style={{ flex: 1 }}>
            <Text style={styles.showTitle}>{showTitle}</Text>
            <Text style={styles.showDate}>📅 {formattedDate}</Text>
            {room ? <Text style={styles.showDate}>🏛 Αίθουσα {room}</Text> : null}
          </View>
          <View style={styles.priceBadge}>
            <Text style={styles.price}>€{price}</Text>
            <Text style={styles.priceLbl}>ανά θέση</Text>
          </View>
        </View>

        <View style={styles.availabilityBar}>
          <View style={styles.availItem}>
            <View style={[styles.availDot, { backgroundColor: colors.green }]} />
            <Text style={styles.availText}>{availableCount} Ελεύθερες</Text>
          </View>
          <View style={styles.availItem}>
            <View style={[styles.availDot, { backgroundColor: '#374151' }]} />
            <Text style={styles.availText}>{bookedCount} Κατειλημμένες</Text>
          </View>
          <View style={styles.liveTag}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live</Text>
          </View>
        </View>

        <View style={styles.stage}>
          <View style={styles.stageBar} />
          <Text style={styles.stageLabel}>ΣΚΗΝΗ</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 30 }} size="large" />
        ) : (
          <View style={styles.seatsContainer}>
            {sortedRowKeys.map(row => (
              <View key={row} style={styles.seatRow}>
                <Text style={styles.rowLabel}>{row}</Text>
                <View style={styles.seatsInRow}>
                  {rowsMap[row].map(seat => {
                    const taken = seat.status === 'booked';
                    const isSelected = selectedIds.includes(seat.seat_id);

                    let seatStyle = [styles.seat];
                    let textStyle = [styles.seatText];
                    if (taken) {
                      seatStyle.push(styles.seatTaken);
                      textStyle.push(styles.seatTextTaken);
                    } else if (isSelected) {
                      seatStyle.push(styles.seatSelected);
                      textStyle.push(styles.seatTextSelected);
                    }

                    return (
                      <TouchableOpacity
                        key={seat.seat_id}
                        style={seatStyle}
                        onPress={() => toggleSeat(seat)}
                        disabled={taken}
                        activeOpacity={0.6}
                      >
                        <Text style={textStyle}>{seat.seat_number.slice(1)}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Text style={styles.rowLabel}>{row}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.inputBg, borderColor: colors.border, borderWidth: 1.5 }]} />
            <Text style={styles.legendText}>Ελεύθερη</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
            <Text style={styles.legendText}>Επιλεγμένη</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#374151' }]} />
            <Text style={styles.legendText}>Κατειλημμένη</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {selectedIds.length > 0 && (
          <View style={styles.selectedInfo}>
            <View>
              <Text style={styles.seatsChosen}>
                {selectedIds.length} {selectedIds.length === 1 ? 'θέση' : 'θέσεις'}
              </Text>
              <Text style={styles.seatsLabel}>
                {selectedIds.map(id => seats.find(s => s.seat_id === id)?.seat_number).filter(Boolean).join(', ')}
              </Text>
            </View>
            <Text style={styles.total}>€{totalPrice}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.btnBook, (selectedIds.length === 0 || booking) && styles.btnBookDisabled]}
          onPress={handleBook}
          disabled={booking || selectedIds.length === 0}
          activeOpacity={0.85}
        >
          {booking ? <ActivityIndicator color="#fff" /> : (
            <Text style={styles.btnBookText}>
              {selectedIds.length === 0 ? 'Επίλεξε θέση' : (isGuest ? 'Σύνδεση για Κράτηση →' : 'Κράτηση  →')}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <AuthPromptModal
        visible={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        navigation={navigation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', paddingHorizontal: 24, paddingTop: 50, paddingBottom: 8, alignItems: 'center', gap: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(233,69,96,0.15)', alignItems: 'center', justifyContent: 'center' },
  back: { color: colors.accent, fontSize: 24, fontWeight: '700' },
  sub: { color: colors.muted, fontSize: 12 },
  title: { color: colors.white, fontSize: 22, fontWeight: '700' },
  showInfo: { backgroundColor: '#1A1A2E', marginHorizontal: 24, marginTop: 16, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  showTitle: { color: colors.white, fontSize: 15, fontWeight: '700', marginBottom: 6 },
  showDate: { color: colors.muted, fontSize: 12, marginTop: 2 },
  priceBadge: { backgroundColor: 'rgba(233,69,96,0.15)', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(233,69,96,0.25)' },
  price: { color: colors.accent, fontSize: 18, fontWeight: '800' },
  priceLbl: { color: colors.muted, fontSize: 10 },
  availabilityBar: { flexDirection: 'row', marginHorizontal: 24, marginTop: 14, gap: 16, alignItems: 'center' },
  availItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  availDot: { width: 8, height: 8, borderRadius: 4 },
  availText: { color: colors.muted, fontSize: 11, fontWeight: '600' },
  liveTag: { flexDirection: 'row', alignItems: 'center', gap: 5, marginLeft: 'auto', backgroundColor: 'rgba(2,195,154,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green },
  liveText: { color: colors.green, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  stage: { marginHorizontal: 40, marginTop: 22, marginBottom: 18, alignItems: 'center' },
  stageBar: { height: 4, backgroundColor: colors.accent, width: '100%', borderRadius: 4, marginBottom: 8 },
  stageLabel: { color: colors.muted, fontSize: 10, letterSpacing: 3, fontWeight: '700' },
  seatsContainer: { paddingHorizontal: 20, marginBottom: 20 },
  seatRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, justifyContent: 'center' },
  rowLabel: { color: '#4B5563', fontSize: 11, width: 16, textAlign: 'center', fontWeight: '700' },
  seatsInRow: { flexDirection: 'row', flex: 1, justifyContent: 'center', gap: 5 },
  seat: { width: 32, height: 32, borderRadius: 7, backgroundColor: colors.inputBg, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  seatTaken: { backgroundColor: '#374151', borderColor: '#4B5563' },
  seatSelected: { backgroundColor: colors.accent, borderColor: colors.accent, transform: [{ scale: 1.1 }] },
  seatText: { color: colors.muted, fontSize: 9, fontWeight: '600' },
  seatTextTaken: { color: '#6B7280' },
  seatTextSelected: { color: '#fff', fontWeight: '800' },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 18, marginTop: 8, marginBottom: 16, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 14, height: 14, borderRadius: 4 },
  legendText: { color: '#9CA3AF', fontSize: 11, fontWeight: '500' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#1A1A2E', borderTopWidth: 1, borderTopColor: colors.border, padding: 16, paddingBottom: 28 },
  selectedInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 },
  seatsChosen: { color: colors.white, fontSize: 14, fontWeight: '700' },
  seatsLabel: { color: colors.muted, fontSize: 12, marginTop: 2 },
  total: { color: colors.accent, fontSize: 22, fontWeight: '800' },
  btnBook: { backgroundColor: colors.accent, borderRadius: 14, padding: 16, alignItems: 'center' },
  btnBookDisabled: { backgroundColor: '#374151', opacity: 0.6 },
  btnBookText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
