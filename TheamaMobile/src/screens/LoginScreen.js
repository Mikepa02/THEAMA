import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, continueAsGuest } = useAuth();

  async function handleLogin() {
    setError('');
    if (!email) { setError('Συμπληρώστε το email σας'); return; }
    if (!password) { setError('Συμπληρώστε τον κωδικό σας'); return; }

    setLoading(true);
    try {
      await login(email, password);
    } catch (e) {
      const msg = e.response?.data?.error || 'Σφάλμα σύνδεσης. Δοκιμάστε ξανά.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.dark }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroBg}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />
        </View>

        <View style={styles.logoArea}>
          <View style={styles.logoIcon}><Text style={styles.logoEmoji}>🎭</Text></View>
          <Text style={styles.appName}>Theama</Text>
          <Text style={styles.appSub}>Κράτησε τη θέση σου εύκολα και γρήγορα</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Καλωσήρθες!</Text>
          <Text style={styles.cardSub}>Συνδέσου στον λογαριασμό σου</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>⚠</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>EMAIL</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.inputIcon}>✉</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(t) => { setEmail(t); setError(''); }}
              placeholder="email@example.com"
              placeholderTextColor="#4B5563"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <Text style={styles.label}>ΚΩΔΙΚΟΣ</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={(t) => { setPassword(t); setError(''); }}
              placeholder="••••••••"
              placeholderTextColor="#4B5563"
              secureTextEntry={!showPwd}
            />
            <TouchableOpacity onPress={() => setShowPwd(!showPwd)}>
              <Text style={styles.eye}>{showPwd ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Σύνδεση →</Text>}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ή</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.btnGuest} onPress={continueAsGuest} activeOpacity={0.8}>
            <Text style={styles.btnGuestText}>👤  Είσοδος ως Επισκέπτης</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 18 }}>
            <Text style={styles.signupRow}>
              Νέος χρήστης; <Text style={styles.signupLink}>Δημιούργησε λογαριασμό</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.adminHint}>
          <Text style={styles.adminHintText}>👨‍💼 Admin: admin@theama.gr / admin123</Text>
        </View>

        <Text style={styles.footer}>CN6035 · Mobile & Distributed Systems</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 28, paddingTop: 70, paddingBottom: 40, minHeight: '100%' },
  heroBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 300, overflow: 'hidden' },
  heroCircle1: { position: 'absolute', top: -100, right: -80, width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(233,69,96,0.08)' },
  heroCircle2: { position: 'absolute', top: -50, left: -100, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(15,52,96,0.4)' },
  logoArea: { alignItems: 'center', marginBottom: 32 },
  logoIcon: { width: 80, height: 80, backgroundColor: colors.accent, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: colors.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  logoEmoji: { fontSize: 38 },
  appName: { color: colors.white, fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  appSub: { color: colors.muted, fontSize: 13, marginTop: 6, textAlign: 'center' },
  card: { backgroundColor: 'rgba(30,42,69,0.5)', borderRadius: 24, padding: 26, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  cardTitle: { color: colors.white, fontSize: 22, fontWeight: '700', marginBottom: 4 },
  cardSub: { color: colors.muted, fontSize: 13, marginBottom: 22 },
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(220,38,38,0.15)', borderWidth: 1, borderColor: 'rgba(220,38,38,0.4)', borderRadius: 12, padding: 12, marginBottom: 18, gap: 10 },
  errorIcon: { fontSize: 16 },
  errorText: { color: '#FCA5A5', fontSize: 13, flex: 1, fontWeight: '600' },
  label: { color: '#9CA3AF', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBg, borderWidth: 1.5, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, marginBottom: 16 },
  inputIcon: { fontSize: 16, marginRight: 10, opacity: 0.6 },
  input: { flex: 1, paddingVertical: 14, color: colors.white, fontSize: 15 },
  eye: { fontSize: 18, paddingHorizontal: 4 },
  btnPrimary: { backgroundColor: colors.accent, borderRadius: 14, padding: 17, alignItems: 'center', marginTop: 6, shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  btnPrimaryText: { color: colors.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.muted, fontSize: 12 },
  btnGuest: { backgroundColor: 'transparent', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: colors.teal },
  btnGuestText: { color: colors.teal, fontSize: 14, fontWeight: '700' },
  signupRow: { textAlign: 'center', color: colors.muted, fontSize: 14 },
  signupLink: { color: colors.accent, fontWeight: '700' },
  adminHint: { backgroundColor: 'rgba(246,201,14,0.1)', borderRadius: 10, padding: 12, marginTop: 18, borderWidth: 1, borderColor: 'rgba(246,201,14,0.25)' },
  adminHintText: { color: colors.gold, fontSize: 11, textAlign: 'center', fontWeight: '600' },
  footer: { color: '#4B5563', fontSize: 11, textAlign: 'center', marginTop: 20, letterSpacing: 0.5 },
});
