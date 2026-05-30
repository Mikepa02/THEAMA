import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../theme/colors';

export default function ConfirmationScreen({ navigation, route }) {
  const { seats, showTitle, theatreName, date, room, total } = route.params;
  const bookingId = `TH-2026-${Math.floor(Math.random() * 99999).toString().padStart(5, '0')}`;
  const d = new Date(date);
  const dateStr = d.toLocaleDateString('el-GR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = d.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.successArea}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>
        <Text style={styles.successTitle}>Κράτηση Επιτυχής!</Text>
        <Text style={styles.successSub}>Τα εισιτήριά σου είναι έτοιμα</Text>
      </View>

      <View style={styles.ticket}>
        <View style={styles.ticketHeader}>
          <Text style={styles.showTitle}>{showTitle}</Text>
          <Text style={styles.theatreName}>{theatreName}</Text>
        </View>

        <View style={styles.ticketDivider}>
          <View style={styles.dividerCircleLeft} />
          <View style={styles.dividerLine} />
          <View style={styles.dividerCircleRight} />
        </View>

        <View style={styles.ticketBody}>
          <View style={styles.infoRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.lbl}>ΗΜΕΡΟΜΗΝΙΑ</Text>
              <Text style={styles.val}>{dateStr}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.lbl}>ΩΡΑ</Text>
              <Text style={styles.val}>{timeStr}</Text>
            </View>
            {room && (
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={styles.lbl}>ΑΙΘΟΥΣΑ</Text>
                <Text style={styles.val}>{room}</Text>
              </View>
            )}
          </View>
          <View style={styles.infoRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.lbl}>ΘΕΣΕΙΣ</Text>
              <Text style={styles.val}>{seats.join(', ')}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={styles.lbl}>ΑΡΙΘΜΟΣ</Text>
              <Text style={styles.val}>{seats.length} εισιτήρι{seats.length === 1 ? 'ο' : 'α'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.ticketFooter}>
          <View>
            <Text style={styles.lblSmall}>Κωδικός κράτησης</Text>
            <Text style={styles.bookingId}>#{bookingId}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.lblSmall}>Σύνολο</Text>
            <Text style={styles.totalPrice}>€{total.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('Main', { screen: 'Προφίλ' })} activeOpacity={0.85}>
        <Text style={styles.btnPrimaryText}>Δες τις κρατήσεις μου  →</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.navigate('Main')} activeOpacity={0.85}>
        <Text style={styles.btnSecondaryText}>Επιστροφή στην αρχική</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  content: { paddingTop: 60, paddingBottom: 40, paddingHorizontal: 24 },
  successArea: { alignItems: 'center', marginBottom: 28 },
  checkCircle: { width: 90, height: 90, backgroundColor: 'rgba(2,195,154,0.15)', borderRadius: 45, alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: colors.green, marginBottom: 18 },
  checkIcon: { fontSize: 44, color: colors.green },
  successTitle: { color: colors.white, fontSize: 26, fontWeight: '800', marginBottom: 6 },
  successSub: { color: colors.muted, fontSize: 14 },

  ticket: { backgroundColor: '#1A1A2E', borderRadius: 24, marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  ticketHeader: { backgroundColor: colors.accent, padding: 22 },
  showTitle: { color: colors.white, fontSize: 18, fontWeight: '800' },
  theatreName: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 4 },

  ticketDivider: { flexDirection: 'row', alignItems: 'center', height: 14 },
  dividerCircleLeft: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.dark, marginLeft: -14 },
  dividerLine: { flex: 1, borderTopWidth: 1.5, borderTopColor: colors.border, borderStyle: 'dashed' },
  dividerCircleRight: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.dark, marginRight: -14 },

  ticketBody: { padding: 20 },
  infoRow: { flexDirection: 'row', marginBottom: 16 },
  lbl: { color: colors.muted, fontSize: 10, letterSpacing: 1, fontWeight: '700', marginBottom: 5 },
  val: { color: colors.white, fontSize: 14, fontWeight: '700' },

  ticketFooter: { backgroundColor: '#0F0F1A', padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lblSmall: { color: colors.muted, fontSize: 10, letterSpacing: 0.5 },
  bookingId: { color: '#9CA3AF', fontSize: 13, fontFamily: 'monospace', letterSpacing: 1, marginTop: 4 },
  totalPrice: { color: colors.accent, fontSize: 22, fontWeight: '800', marginTop: 2 },

  btnPrimary: { backgroundColor: colors.accent, borderRadius: 14, padding: 17, alignItems: 'center', marginBottom: 12 },
  btnPrimaryText: { color: colors.white, fontSize: 15, fontWeight: '700' },
  btnSecondary: { backgroundColor: 'transparent', borderRadius: 14, padding: 17, alignItems: 'center', borderWidth: 1.5, borderColor: colors.border },
  btnSecondaryText: { color: colors.muted, fontSize: 14, fontWeight: '600' },
});
