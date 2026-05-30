import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export default function AuthPromptModal({ visible, onClose, navigation }) {
  const { logout } = useAuth();

  async function handleNavigate(screen) {
    onClose();
    await logout(); // Clear guest mode → στέλνει στο login
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.iconBox}>
            <Text style={styles.icon}>🔒</Text>
          </View>
          <Text style={styles.title}>Απαιτείται Σύνδεση</Text>
          <Text style={styles.subtitle}>Για να κάνεις κράτηση χρειάζεται να είσαι συνδεδεμένος</Text>

          <TouchableOpacity style={styles.btnPrimary} onPress={() => handleNavigate('Login')} activeOpacity={0.85}>
            <Text style={styles.btnPrimaryText}>Σύνδεση</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnSecondary} onPress={() => handleNavigate('Register')} activeOpacity={0.85}>
            <Text style={styles.btnSecondaryText}>Δημιουργία Λογαριασμού</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={{ marginTop: 12 }}>
            <Text style={styles.cancel}>Ακύρωση</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { backgroundColor: '#1A1A2E', borderRadius: 24, padding: 28, width: '100%', maxWidth: 360, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  iconBox: { width: 72, height: 72, backgroundColor: 'rgba(233,69,96,0.15)', borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 2, borderColor: colors.accent },
  icon: { fontSize: 36 },
  title: { color: colors.white, fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  subtitle: { color: colors.muted, fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  btnPrimary: { backgroundColor: colors.accent, borderRadius: 14, padding: 16, alignItems: 'center', width: '100%', marginBottom: 10 },
  btnPrimaryText: { color: colors.white, fontSize: 15, fontWeight: '700' },
  btnSecondary: { backgroundColor: 'transparent', borderRadius: 14, padding: 16, alignItems: 'center', width: '100%', borderWidth: 1.5, borderColor: colors.border },
  btnSecondaryText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  cancel: { color: colors.muted, fontSize: 13 },
});
