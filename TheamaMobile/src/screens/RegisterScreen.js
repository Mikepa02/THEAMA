import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();

  async function handleRegister() {
    setError('');
    if (!name) { setError('Συμπληρώστε το όνομά σας'); return; }
    if (!email) { setError('Συμπληρώστε το email σας'); return; }
    if (!password) { setError('Συμπληρώστε τον κωδικό σας'); return; }
    if (password.length < 6) { setError('Ο κωδικός πρέπει να είναι τουλάχιστον 6 χαρακτήρες'); return; }
    if (!email.includes('@')) { setError('Μη έγκυρο email'); return; }

    setLoading(true);
    try {
      await register(name, email, password);
    } catch (e) {
      const msg = e.response?.data?.error || 'Σφάλμα εγγραφής. Δοκιμάστε ξανά.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.dark }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Πίσω</Text>
        </TouchableOpacity>

        <View style={styles.logoArea}>
          <View style={styles.logoIcon}><Text style={styles.logoEmoji}>🎭</Text></View>
          <Text style={styles.appName}>Νέος Λογαριασμός</Text>
          <Text style={styles.appSub}>Συμπληρώστε τα στοιχεία σας</Text>
        </View>

        <View style={styles.card}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>⚠</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>ΟΝΟΜΑ</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput style={styles.input} value={name} onChangeText={(t) => { setName(t); setError(''); }} placeholder="Mike" placeholderTextColor="#4B5563" />
          </View>

          <Text style={styles.label}>EMAIL</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.inputIcon}>✉</Text>
            <TextInput style={styles.input} value={email} onChangeText={(t) => { setEmail(t); setError(''); }} placeholder="email@example.com" placeholderTextColor="#4B5563" autoCapitalize="none" keyboardType="email-address" />
          </View>

          <Text style={styles.label}>ΚΩΔΙΚΟΣ</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput style={styles.input} value={password} onChangeText={(t) => { setPassword(t); setError(''); }} placeholder="τουλάχιστον 6 χαρακτήρες" placeholderTextColor="#4B5563" secureTextEntry={!showPwd} />
            <TouchableOpacity onPress={() => setShowPwd(!showPwd)}>
              <Text style={styles.eye}>{showPwd ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.btnPrimary} onPress={handleRegister} disabled={loading} activeOpacity={0.8}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Δημιουργία Λογαριασμού</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
            <Text style={styles.signupRow}>Έχεις ήδη λογαριασμό; <Text style={styles.signupLink}>Σύνδεση</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 28, paddingTop: 50, paddingBottom: 40 },
  backBtn: { marginBottom: 10 },
  backText: { color: colors.accent, fontSize: 16, fontWeight: '600' },
  logoArea: { alignItems: 'center', marginBottom: 28, marginTop: 10 },
  logoIcon: { width: 70, height: 70, backgroundColor: colors.accent, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  logoEmoji: { fontSize: 34 },
  appName: { color: colors.white, fontSize: 24, fontWeight: '800' },
  appSub: { color: colors.muted, fontSize: 13, marginTop: 6 },
  card: { backgroundColor: 'rgba(30,42,69,0.5)', borderRadius: 24, padding: 26, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(220,38,38,0.15)', borderWidth: 1, borderColor: 'rgba(220,38,38,0.4)', borderRadius: 12, padding: 12, marginBottom: 18, gap: 10 },
  errorIcon: { fontSize: 16 },
  errorText: { color: '#FCA5A5', fontSize: 13, flex: 1, fontWeight: '600' },
  label: { color: '#9CA3AF', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBg, borderWidth: 1.5, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, marginBottom: 16 },
  inputIcon: { fontSize: 16, marginRight: 10, opacity: 0.6 },
  input: { flex: 1, paddingVertical: 14, color: colors.white, fontSize: 15 },
  eye: { fontSize: 18, paddingHorizontal: 4 },
  btnPrimary: { backgroundColor: colors.accent, borderRadius: 14, padding: 17, alignItems: 'center', marginTop: 8 },
  btnPrimaryText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  signupRow: { textAlign: 'center', color: colors.muted, fontSize: 14 },
  signupLink: { color: colors.accent, fontWeight: '700' },
});
