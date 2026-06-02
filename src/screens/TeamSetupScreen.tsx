import React, { useState } from 'react';
import { ActivityIndicator, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase-config';
import { useFirebaseAuth } from '../services/authService';
import { Team, useTeam } from '../services/teamContext';

interface Props { onNext: () => void; }

export function TeamSetupScreen({ onNext }: Props) {
  const { t } = useTranslation();
  const { signUp } = useFirebaseAuth();
  const { setTeam } = useTeam();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState<string[]>(['']);
  const [yearLevel, setYearLevel] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddMember = () => {
    if (newMemberName.trim()) {
      setMembers([...members, newMemberName.trim()]);
      setNewMemberName('');
    }
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleMemberChange = (text: string, index: number) => {
    const updated = [...members];
    updated[index] = text;
    setMembers(updated);
  };

  const handleContinue = async () => {
    const cleanEmail = email.trim();
    const cleanTeamName = teamName.trim();
    if (!cleanEmail || !password || !cleanTeamName) {
      setError('Please enter an email, password, and team name.');
      return;
    }

    setLoading(true);
    setError('');
    
    const cleanMembers = members.filter((m) => m.trim() !== '');
    const generatedId = `${cleanTeamName} #${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const credential = await signUp(cleanEmail, password);

      const newTeam: Team = {
        id: generatedId,
        teamId: generatedId,
        teamName: cleanTeamName,
        members: cleanMembers,
        yearLevel: yearLevel.trim(),
        ownerUid: credential.user.uid,
        ownerEmail: credential.user.email,
      };

      await setDoc(doc(db, 'teams', newTeam.id), newTeam);
      await setTeam(newTeam);
      
      onNext();
    } catch (e) {
      console.error('Team setup error:', e);
      setError('Could not create your account. Check the email, password, and connection.');
    } finally {
      setLoading(false);
    }
  };

  const disabled = loading || !email.trim() || !password || !teamName.trim();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('onboarding.teamSetup')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.createProfile')}</Text>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (error) setError('');
          }}
          placeholder="you@example.com"
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          editable={!loading}
          keyboardType="email-address"
          textContentType="emailAddress"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (error) setError('');
          }}
          placeholder="At least 6 characters"
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          autoComplete="password"
          autoCorrect={false}
          editable={!loading}
          secureTextEntry
          textContentType="newPassword"
        />

        <Text style={styles.label}>{t('common.teamName')}</Text>
        <TextInput 
          style={styles.input} 
          value={teamName} 
          onChangeText={(text) => {
            setTeamName(text);
            if (error) setError('');
          }}
          placeholder="Enter team name"
          editable={!loading}
        />

        <View style={styles.rowHeader}>
          <Text style={styles.label}>{t('common.teamMembers')}</Text>
        </View>

        {members.map((member, index) => (
          <View key={index} style={styles.memberRow}>
            <TextInput 
              style={[styles.input, { flex: 1, marginBottom: 0 }]} 
              value={member} 
              onChangeText={(text) => handleMemberChange(text, index)}
            />
            <TouchableOpacity onPress={() => handleRemoveMember(index)}>
              <Text style={styles.removeIcon}>x</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={[styles.memberRow, { marginTop: 8 }]}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Add new member name..."
            value={newMemberName}
            onChangeText={setNewMemberName}
          />
          <TouchableOpacity onPress={handleAddMember}>
            <Text style={styles.addIcon}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { marginTop: 24 }]}>{t('common.yearLevel')}</Text>
        <TextInput
          style={styles.input}
          value={yearLevel}
          onChangeText={setYearLevel}
          keyboardType="numeric"
          placeholder="7"
          editable={!loading}
        />

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>

      <TouchableOpacity 
        style={[styles.btn, disabled && { opacity: 0.6 }]} 
        onPress={handleContinue} 
        disabled={disabled}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.btnText}>{t('onboarding.continue')}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 48, backgroundColor: '#fff' },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#2F3E46', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#7A8A99' },
  form: { flex: 1 },
  label: { fontSize: 16, color: '#2F3E46', fontWeight: '800', marginBottom: 6 },
  input: { borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#f9fafb', color: '#2F3E46', marginBottom: 12, fontSize: 16 },
  errorBox: { backgroundColor: '#fee2e2', borderRadius: 10, marginBottom: 16, padding: 12 },
  errorText: { color: '#dc2626', fontSize: 14, fontWeight: '600' },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  addIcon: { fontSize: 22, color: '#0074D9', fontWeight: '900', paddingHorizontal: 8 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  removeIcon: { fontSize: 18, color: '#d4183d', paddingHorizontal: 8, fontWeight: '900' },
  btn: { paddingVertical: 16, borderRadius: 14, backgroundColor: '#0074D9', alignItems: 'center', marginBottom: 24 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
