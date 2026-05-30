import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, Modal, ActivityIndicator, Pressable } from 'react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function AdminScreen() {
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null);
  const { logout } = useAuth();

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadAll() {
    try {
      const [s, t, sh, res] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/theatres'),
        api.get('/shows'),
        api.get('/admin/reservations'),
      ]);
      setStats(s.data);
      setTheatres(t.data);
      setShows(sh.data);
      setReservations(res.data);

      // Load all showtimes for all shows
      const showtimePromises = sh.data.map(show => api.get('/showtimes', { params: { showId: show.show_id } }));
      const showtimeResults = await Promise.all(showtimePromises);
      const allShowtimes = [];
      showtimeResults.forEach((result, idx) => {
        result.data.forEach(st => {
          allShowtimes.push({ ...st, show_title: sh.data[idx].title, show_id: sh.data[idx].show_id });
        });
      });
      setShowtimes(allShowtimes);
    } catch (e) {
      console.error('Admin load error:', e);
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(type, id, name) {
    if (!confirm(`Διαγραφή "${name}";`)) return;
    try {
      await api.delete(`/admin/${type}/${id}`);
      loadAll();
    } catch (e) {
      Alert.alert('Σφάλμα', e.response?.data?.error || 'Αποτυχία διαγραφής');
    }
  }

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator color={colors.accent} size="large" /></View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.dark }}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>ADMIN PANEL</Text>
          <Text style={styles.headerTitle}>Theama Διαχείριση</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>🚪 Έξοδος</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {[
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'theatres', label: '🎭 Θέατρα' },
          { id: 'shows', label: '🎬 Παραστάσεις' },
          { id: 'showtimes', label: '📅 Showtimes' },
          { id: 'reservations', label: '🎫 Κρατήσεις' },
        ].map(t => (
          <TouchableOpacity key={t.id} style={[styles.tab, tab === t.id && styles.tabActive]} onPress={() => setTab(t.id)}>
            <Text style={[styles.tabText, tab === t.id && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {tab === 'dashboard' && (
          <View>
            <View style={styles.statsGrid}>
              <StatCard icon="👥" label="Χρήστες" value={stats?.users || 0} color={colors.teal} />
              <StatCard icon="🎭" label="Θέατρα" value={stats?.theatres || 0} color={colors.accent} />
              <StatCard icon="🎬" label="Παραστάσεις" value={stats?.shows || 0} color={colors.gold} />
              <StatCard icon="🎫" label="Κρατήσεις" value={stats?.reservations || 0} color={colors.green} />
            </View>
            <View style={styles.revenueBox}>
              <Text style={styles.revenueLbl}>💰 Συνολικά Έσοδα</Text>
              <Text style={styles.revenueVal}>€{(stats?.revenue || 0).toFixed(2)}</Text>
            </View>

            <Text style={styles.sectionTitle}>📈 Πρόσφατες Κρατήσεις</Text>
            {reservations.slice(0, 5).map(r => (
              <View key={r.reservation_id} style={styles.recentItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recentTitle}>{r.show_title}</Text>
                  <Text style={styles.recentSub}>{r.user_name} · {r.seat_number} · €{r.price}</Text>
                </View>
                <Text style={styles.recentDate}>{new Date(r.created_at).toLocaleDateString('el-GR')}</Text>
              </View>
            ))}
          </View>
        )}

        {tab === 'theatres' && (
          <View>
            <TouchableOpacity style={styles.addBtn} onPress={() => setModalType('theatre')}>
              <Text style={styles.addBtnText}>+ Προσθήκη Θεάτρου</Text>
            </TouchableOpacity>
            {theatres.map(t => (
              <View key={t.theatre_id} style={styles.itemCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{t.name}</Text>
                  <Text style={styles.itemSub}>📍 {t.location}</Text>
                  <Text style={styles.itemDesc}>{t.description}</Text>
                </View>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteItem('theatres', t.theatre_id, t.name)}>
                  <Text style={styles.deleteText}>Διαγραφή</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {tab === 'shows' && (
          <View>
            <TouchableOpacity style={styles.addBtn} onPress={() => setModalType('show')}>
              <Text style={styles.addBtnText}>+ Προσθήκη Παράστασης</Text>
            </TouchableOpacity>
            {shows.map(s => (
              <View key={s.show_id} style={styles.itemCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{s.title}</Text>
                  <Text style={styles.itemSub}>🎭 {s.theatre_name} · ⏱ {s.duration} λεπτά</Text>
                  <Text style={styles.itemDesc}>{s.description}</Text>
                </View>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteItem('shows', s.show_id, s.title)}>
                  <Text style={styles.deleteText}>Διαγραφή</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {tab === 'showtimes' && (
          <View>
            <TouchableOpacity style={styles.addBtn} onPress={() => setModalType('showtime')}>
              <Text style={styles.addBtnText}>+ Προσθήκη Showtime</Text>
            </TouchableOpacity>
            {showtimes.map(st => (
              <View key={st.showtime_id} style={styles.itemCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{st.show_title}</Text>
                  <Text style={styles.itemSub}>📅 {new Date(st.date_time).toLocaleString('el-GR')} · 🏛 {st.room}</Text>
                  <Text style={styles.itemDesc}>€{st.price}</Text>
                </View>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteItem('showtimes', st.showtime_id, st.show_title)}>
                  <Text style={styles.deleteText}>Διαγραφή</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {tab === 'reservations' && (
          <View>
            <Text style={styles.infoBox}>📊 Σύνολο: {reservations.length} ενεργές κρατήσεις · Real-time updates</Text>
            {reservations.map(r => (
              <View key={r.reservation_id} style={styles.itemCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{r.show_title} · {r.seat_number}</Text>
                  <Text style={styles.itemSub}>👤 {r.user_name} ({r.user_email})</Text>
                  <Text style={styles.itemSub}>🎭 {r.theatre_name} · 📅 {new Date(r.date_time).toLocaleString('el-GR')}</Text>
                  <Text style={styles.itemDesc}>💰 €{r.price} · Κωδικός: #{r.reservation_id}</Text>
                </View>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteItem('reservations', r.reservation_id, `${r.show_title} ${r.seat_number}`)}>
                  <Text style={styles.deleteText}>Ακύρωση</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <AddModal type={modalType} onClose={() => setModalType(null)} onSaved={loadAll} theatres={theatres} shows={shows} />
    </View>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function AddModal({ type, onClose, onSaved, theatres, shows }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm({}); }, [type]);

  async function handleSave() {
    setSaving(true);
    try {
      let endpoint = '';
      let payload = {};
      if (type === 'theatre') {
        endpoint = '/admin/theatres';
        payload = { name: form.name, location: form.location, description: form.description };
      } else if (type === 'show') {
        endpoint = '/admin/shows';
        payload = { theatre_id: form.theatre_id, title: form.title, description: form.description, duration: parseInt(form.duration), age_rating: form.age_rating };
      } else if (type === 'showtime') {
        endpoint = '/admin/showtimes';
        payload = { show_id: form.show_id, date_time: form.date_time, room: form.room, price: parseFloat(form.price) };
      }
      await api.post(endpoint, payload);
      onSaved();
      onClose();
    } catch (e) {
      Alert.alert('Σφάλμα', e.response?.data?.error || 'Αποτυχία');
    } finally {
      setSaving(false);
    }
  }

  if (!type) return null;

  return (
    <Modal visible={!!type} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <Text style={styles.modalTitle}>
            {type === 'theatre' ? '🎭 Νέο Θέατρο' : type === 'show' ? '🎬 Νέα Παράσταση' : '📅 Νέο Showtime'}
          </Text>

          {type === 'theatre' && (
            <>
              <TextInput style={styles.modalInput} placeholder="Όνομα" placeholderTextColor="#6B7280" value={form.name || ''} onChangeText={v => setForm({ ...form, name: v })} />
              <TextInput style={styles.modalInput} placeholder="Τοποθεσία" placeholderTextColor="#6B7280" value={form.location || ''} onChangeText={v => setForm({ ...form, location: v })} />
              <TextInput style={styles.modalInput} placeholder="Περιγραφή" placeholderTextColor="#6B7280" value={form.description || ''} onChangeText={v => setForm({ ...form, description: v })} multiline />
            </>
          )}

          {type === 'show' && (
            <>
              <Text style={styles.modalLabel}>Θέατρο:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {theatres.map(t => (
                  <TouchableOpacity key={t.theatre_id} style={[styles.chip, form.theatre_id === t.theatre_id && styles.chipActive]} onPress={() => setForm({ ...form, theatre_id: t.theatre_id })}>
                    <Text style={[styles.chipText, form.theatre_id === t.theatre_id && styles.chipTextActive]}>{t.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TextInput style={styles.modalInput} placeholder="Τίτλος" placeholderTextColor="#6B7280" value={form.title || ''} onChangeText={v => setForm({ ...form, title: v })} />
              <TextInput style={styles.modalInput} placeholder="Περιγραφή" placeholderTextColor="#6B7280" value={form.description || ''} onChangeText={v => setForm({ ...form, description: v })} multiline />
              <TextInput style={styles.modalInput} placeholder="Διάρκεια (λεπτά)" placeholderTextColor="#6B7280" value={form.duration || ''} onChangeText={v => setForm({ ...form, duration: v })} keyboardType="numeric" />
              <TextInput style={styles.modalInput} placeholder="Όριο ηλικίας (12+, 15+, κλπ)" placeholderTextColor="#6B7280" value={form.age_rating || ''} onChangeText={v => setForm({ ...form, age_rating: v })} />
            </>
          )}

          {type === 'showtime' && (
            <>
              <Text style={styles.modalLabel}>Παράσταση:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {shows.map(s => (
                  <TouchableOpacity key={s.show_id} style={[styles.chip, form.show_id === s.show_id && styles.chipActive]} onPress={() => setForm({ ...form, show_id: s.show_id })}>
                    <Text style={[styles.chipText, form.show_id === s.show_id && styles.chipTextActive]}>{s.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TextInput style={styles.modalInput} placeholder="Ημερομηνία/Ώρα (YYYY-MM-DD HH:MM:SS)" placeholderTextColor="#6B7280" value={form.date_time || ''} onChangeText={v => setForm({ ...form, date_time: v })} />
              <TextInput style={styles.modalInput} placeholder="Αίθουσα" placeholderTextColor="#6B7280" value={form.room || ''} onChangeText={v => setForm({ ...form, room: v })} />
              <TextInput style={styles.modalInput} placeholder="Τιμή (€)" placeholderTextColor="#6B7280" value={form.price || ''} onChangeText={v => setForm({ ...form, price: v })} keyboardType="numeric" />
              <Text style={styles.modalHint}>💡 Θα δημιουργηθούν αυτόματα 40 θέσεις (A1-D10)</Text>
            </>
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalCancel} onPress={onClose}>
              <Text style={styles.modalCancelText}>Ακύρωση</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalSave} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalSaveText}>Αποθήκευση</Text>}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.dark, alignItems: 'center', justifyContent: 'center' },
  header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border },
  headerSub: { color: colors.gold, fontSize: 10, letterSpacing: 1.5, fontWeight: '700' },
  headerTitle: { color: colors.white, fontSize: 22, fontWeight: '800', marginTop: 2 },
  logoutBtn: { backgroundColor: 'rgba(233,69,96,0.15)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(233,69,96,0.3)' },
  logoutText: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  tabs: { flexDirection: 'row', padding: 12, gap: 6, backgroundColor: '#1A1A2E', flexWrap: 'wrap' },
  tab: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)' },
  tabActive: { backgroundColor: colors.accent },
  tabText: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: '#fff', fontWeight: '700' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  statCard: { flexBasis: '47%', backgroundColor: '#1A1A2E', borderRadius: 14, padding: 14, borderLeftWidth: 4 },
  statIcon: { fontSize: 24, marginBottom: 6 },
  statValue: { color: colors.white, fontSize: 24, fontWeight: '800' },
  statLabel: { color: colors.muted, fontSize: 11, marginTop: 2 },
  revenueBox: { backgroundColor: 'rgba(2,195,154,0.1)', borderWidth: 1, borderColor: 'rgba(2,195,154,0.3)', borderRadius: 14, padding: 18, marginBottom: 20, alignItems: 'center' },
  revenueLbl: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  revenueVal: { color: colors.green, fontSize: 28, fontWeight: '800', marginTop: 6 },
  sectionTitle: { color: colors.white, fontSize: 14, fontWeight: '700', marginBottom: 12 },
  recentItem: { flexDirection: 'row', backgroundColor: '#1A1A2E', borderRadius: 12, padding: 12, marginBottom: 8, alignItems: 'center' },
  recentTitle: { color: colors.white, fontSize: 13, fontWeight: '700' },
  recentSub: { color: colors.muted, fontSize: 11, marginTop: 2 },
  recentDate: { color: colors.gold, fontSize: 11 },
  addBtn: { backgroundColor: colors.accent, borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 14 },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  itemCard: { backgroundColor: '#1A1A2E', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  itemTitle: { color: colors.white, fontSize: 14, fontWeight: '700' },
  itemSub: { color: colors.muted, fontSize: 11, marginTop: 2 },
  itemDesc: { color: colors.muted, fontSize: 11, marginTop: 4, fontStyle: 'italic' },
  deleteBtn: { backgroundColor: 'rgba(220,38,38,0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(220,38,38,0.3)' },
  deleteText: { color: '#FCA5A5', fontSize: 11, fontWeight: '700' },
  infoBox: { color: colors.gold, fontSize: 12, padding: 12, backgroundColor: 'rgba(246,201,14,0.1)', borderRadius: 10, marginBottom: 14, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: '#1A1A2E', borderRadius: 20, padding: 24, width: '100%', maxWidth: 500, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  modalTitle: { color: colors.white, fontSize: 18, fontWeight: '800', marginBottom: 16 },
  modalLabel: { color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8 },
  modalInput: { backgroundColor: colors.inputBg, borderWidth: 1.5, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.white, fontSize: 14, marginBottom: 10 },
  modalHint: { color: colors.gold, fontSize: 11, fontStyle: 'italic', marginTop: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.inputBg, marginRight: 6, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.muted, fontSize: 12 },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  modalCancel: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  modalCancelText: { color: colors.muted, fontSize: 14, fontWeight: '600' },
  modalSave: { flex: 2, padding: 14, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center' },
  modalSaveText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
