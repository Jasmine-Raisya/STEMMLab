import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase-config';
import { useTeam, Team } from '../services/teamContext';

interface Props {
  onBack: () => void;
  onSuccess: () => void;
}

export function TeamLoginScreen({ onBack, onSuccess }: Props) {
  const { t } = useTranslation();
  const { setTeam } = useTeam();

  const [teamCode, setTeamCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const code = teamCode.trim();
    if (!code) {
      setError('Please enter your team code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Query Firestore for a team whose teamId matches the entered code
      const teamsRef = collection(db, 'teams');
      const q = query(teamsRef, where('teamId', '==', code));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError('No team found with that code. Please check and try again.');
        setLoading(false);
        return;
      }

      // Take the first matching document
      const docSnap = snapshot.docs[0];
      const teamData = docSnap.data() as Team;

      // Load the team into context (saves to SQLite + AsyncStorage + state)
      await setTeam(teamData);
      console.log('Team login successful:', teamData.teamId);
      onSuccess();
    } catch (e) {
      console.error('Login error:', e);
      setError('Something went wrong. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backIcon}>‹</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Enter your team code to access your account</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Team Code</Text>
          <TextInput
            style={styles.input}
            value={teamCode}
            onChangeText={(text) => {
              setTeamCode(text);
              if (error) setError('');
            }}
            placeholder="e.g. My Team #1234"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.loginBtn, (!teamCode.trim() || loading) && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={!teamCode.trim() || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.loginBtnText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.helpBox}>
          <Text style={styles.helpText}>
            Your team code was shown when you first created your team.{'\n'}
            It looks like: <Text style={styles.helpBold}>TeamName #1234</Text>
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  backBtn: { paddingHorizontal: 24, paddingTop: 48, paddingBottom: 8 },
  backIcon: { fontSize: 30, fontWeight: '700', color: '#2F3E46', lineHeight: 34 },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  header: { marginBottom: 36 },
  title: { fontSize: 28, fontWeight: '800', color: '#2F3E46', marginBottom: 6 },
  subtitle: { fontSize: 16, color: '#7A8A99' },
  form: {},
  label: { fontSize: 16, color: '#2F3E46', fontWeight: '800', marginBottom: 8 },
  input: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#f9fafb',
    color: '#2F3E46',
    fontSize: 16,
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: '#dc2626', fontSize: 14, fontWeight: '600' },
  loginBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#0074D9',
    alignItems: 'center',
  },
  loginBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  helpBox: {
    marginTop: 32,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
  },
  helpText: { color: '#64748b', fontSize: 14, lineHeight: 20, textAlign: 'center' },
  helpBold: { fontWeight: '800', color: '#2F3E46' },
});
