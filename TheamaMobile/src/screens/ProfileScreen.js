import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => { load(); }, []));

  async function load() {
    setLoading(true);
    try {
      const response = await api.get('/reservations/user');
      setReservations(response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(id) {
    try {
      await api.delete(`/reservations/${id}`);
      load();
    } catch (e) {
      Alert.alert('Σφάλμα', 'Δεν ήταν δυνατή η ακύρωση');
    }
  }

  const upcoming = reservations.filter(r => new Date(r.date_time) > new Date());
  const past = reservations.filter(r => new Date(r.date_time) <= new Date());
  const totalSpent = reservations.reduce((s, r) => s + parseFloat(r.price || 0), 0);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.heroCircle} />
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.stats}>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{reservations.length}</Text>
            <Text style={styles.statLbl}>Σύνολο</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: colors.green }]}>{upcoming.length}</Text>
            <Text style={styles.statLbl}>Επερχόμενες</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: colors.gold }]}>€{totalSpent.toFixed(0)}</Text>
            <Text style={styles.statLbl}>Δαπάνη</Text>
          </View>
        </View>
      </View>

      <Text style={styles.section}>ΟΙ ΚΡΑΤΗΣΕΙΣ ΜΟΥ</Text>

      {loading ? <ActivityIndicator color={colors.accent} size="large" style={{ marginTop: 30 }} /> :
       reservations.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🎫</Text>
          <Text style={styles.emptyText}>Δεν έχεις κρατήσεις ακόμα</Text>
          <Text style={styles.emptySubtext}>Πήγαινε στην αρχική για να κάνεις την πρώτη σου κράτηση</Text>
        </View>
       ) :
        reservations.map(r => {
          const isUpcoming = new Date(r.date_time) > new Date();
          const d = new Date(r.date_time);
          const dateStr = d.toLocaleDateString('el-GR', { day: '2-digit', month: 'short' });
          const timeStr = d.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });

          return (
            <View key={r.reservation_id} style={styles.bookingCard}>
              <View style={[styles.bookingIcon, isUpcoming ? styles.iconUpcoming : styles.iconPast]}>
                <Text style={{ fontSize: 22 }}>🎭</Text>
              </View>
              <View style={styles.bookingInfo}>
                <Text style={styles.bookingShow} numberOfLines={1}>{r.show_title}</Text>
                <Text style={styles.bookingDetails} numberOfLines={1}>{r.theatre_name}</Text>
                <View style={styles.bookingMeta}>
                  <Text style={styles.bookingMetaText}>📅 {dateStr}</Text>
                  <Text style={styles.bookingMetaText}>🕐 {timeStr}</Text>
                  <Text style={styles.bookingMetaText}>💺 {r.seat_number}</Text>
                </View>
              </View>
              <View style={styles.bookingRight}>
                <View style={[styles.badge, isUpcoming ? styles.badgeUpcoming : styles.badgePast]}>
                  <Text style={[styles.badgeText, { color: isUpcoming ? colors.green : '#9CA3AF' }]}>
                    {isUpcoming ? 'Επερχόμενη' : 'Λήξη'}
                  </Text>
                </View>
                <Text style={[styles.bookingPrice, !isUpcoming && { color: colors.muted }]}>€{r.price}</Text>
                {isUpcoming && (
                  <TouchableOpacity onPress={() => handleCancel(r.reservation_id)} style={styles.cancelBtn}>
                    <Text style={styles.cancelLink}>Ακύρωση</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })
      }

      <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.85}>
        <Text style={styles.logoutText}>🚪  Αποσύνδεση</Text>
      </TouchableOpacity>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  hero: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 24, overflow: 'hidden', position: 'relative' },
  heroCircle: { position: 'absolute', top: -100, right: -80, width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(233,69,96,0.08)' },
  profileHeader: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 86, height: 86, backgroundColor: colors.accent, borderRadius: 43, alignItems: 'center', justifyContent: 'center', marginBottom: 14, shadowColor: colors.accent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 },
  avatarText: { color: colors.white, fontSize: 34, fontWeight: '800' },
  name: { color: colors.white, fontSize: 22, fontWeight: '700' },
  email: { color: colors.muted, fontSize: 13, marginTop: 4 },
  stats: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, backgroundColor: 'rgba(30,42,69,0.6)', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  statVal: { color: colors.accent, fontSize: 22, fontWeight: '800' },
  statLbl: { color: colors.muted, fontSize: 11, marginTop: 3 },
  section: { color: '#9CA3AF', fontSize: 11, fontWeight: '700', letterSpacing: 1, paddingHorizontal: 24, marginTop: 24, marginBottom: 14 },
  empty: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 16, opacity: 0.5 },
  emptyText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  emptySubtext: { color: colors.muted, fontSize: 13, marginTop: 6, textAlign: 'center', paddingHorizontal: 30 },
  bookingCard: { backgroundColor: '#1A1A2E', marginHorizontal: 24, marginBottom: 10, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  bookingIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  iconUpcoming: { backgroundColor: 'rgba(233,69,96,0.15)' },
  iconPast: { backgroundColor: 'rgba(107,114,128,0.15)' },
  bookingInfo: { flex: 1 },
  bookingShow: { color: colors.white, fontSize: 14, fontWeight: '700' },
  bookingDetails: { color: colors.muted, fontSize: 12, marginTop: 2 },
  bookingMeta: { flexDirection: 'row', gap: 8, marginTop: 6 },
  bookingMetaText: { color: '#6B7280', fontSize: 10, fontWeight: '600' },
  bookingRight: { alignItems: 'flex-end' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginBottom: 6 },
  badgeUpcoming: { backgroundColor: 'rgba(2,195,154,0.15)' },
  badgePast: { backgroundColor: 'rgba(107,114,128,0.15)' },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  bookingPrice: { color: colors.accent, fontSize: 15, fontWeight: '800' },
  cancelBtn: { marginTop: 6 },
  cancelLink: { color: colors.muted, fontSize: 11, textDecorationLine: 'underline' },
  logoutBtn: { backgroundColor: 'rgba(233,69,96,0.1)', marginHorizontal: 24, marginTop: 24, padding: 16, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(233,69,96,0.25)' },
  logoutText: { color: colors.accent, fontSize: 15, fontWeight: '700' },
});
