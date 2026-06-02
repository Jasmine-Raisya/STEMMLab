import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTeam } from '../services/teamContext';
import { getFirebaseAuthMessage } from '../services/authService';

interface Props {
  onRegistered: () => void;
  onSignedIn: () => void;
}

type AuthMode = 'register' | 'signIn';

export function TeamSetupScreen({ onRegistered, onSignedIn }: Props) {
  const { t } = useTranslation();
  const { registerTeam, signInTeam } = useTeam();
  const [mode, setMode] = useState<AuthMode>('register');
  const [representativeEmail, setRepresentativeEmail] = useState('');
  const [password, setPassword] = useState('');
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState(['']);
  const [gradeLevel, setGradeLevel] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const grades = ['5', '6', '7', '8', '9'];
  const validMembers = useMemo(() => members.map((member) => member.trim()).filter(Boolean), [members]);
  const uniqueMemberKeys = useMemo(() => Array.from(new Set(validMembers.map((member) => member.toLowerCase()))), [validMembers]);
  const authFieldsValid = representativeEmail.includes('@') && password.length >= 6;
  const registrationFieldsValid = teamName.trim().length >= 2 && validMembers.length >= 2 && uniqueMemberKeys.length === validMembers.length && gradeLevel.length > 0;
  const isValid = mode === 'signIn' ? authFieldsValid : authFieldsValid && registrationFieldsValid;

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError('');
  };

  const updateMember = (index: number, value: string) => {
    setError('');
    setMembers((previous) => previous.map((item, itemIndex) => (itemIndex === index ? value : item)));
  };

  const addMember = () => {
    setError('');
    setMembers((previous) => [...previous, '']);
  };

  const removeMember = (index: number) => {
    setError('');
    setMembers((previous) => (previous.length === 1 ? [''] : previous.filter((_, itemIndex) => itemIndex !== index)));
  };

  const handleContinue = async () => {
    const trimmedTeamName = teamName.trim();
    const trimmedEmail = representativeEmail.trim().toLowerCase();
    if (!trimmedEmail.includes('@')) {
      setError(t('validation.emailRequired'));
      return;
    }
    if (password.length < 6) {
      setError(t('validation.passwordRequired'));
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    if (mode === 'signIn') {
      try {
        await signInTeam({ representativeEmail: trimmedEmail, password });
        onSignedIn();
      } catch (signInError) {
        console.warn('Team sign in failed', signInError);
        const message = getFirebaseAuthMessage(signInError) || t('validation.signInFailed');
        setError(message);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
    if (trimmedTeamName.length < 2) {
      setError(t('validation.teamNameRequired'));
      setIsSubmitting(false);
      return;
    }
    if (validMembers.length < 2) {
      setError(t('validation.twoMembersRequired'));
      setIsSubmitting(false);
      return;
    }
    if (uniqueMemberKeys.length !== validMembers.length) {
      setError(t('validation.uniqueMembersRequired'));
      setIsSubmitting(false);
      return;
    }
    if (!gradeLevel) {
      setError(t('validation.gradeRequired'));
      setIsSubmitting(false);
      return;
    }
    try {
      await registerTeam({ representativeEmail: trimmedEmail, password, teamName: trimmedTeamName, members: validMembers, gradeLevel });
      onRegistered();
    } catch (registrationError) {
      console.warn('Team registration failed', registrationError);
      const message = getFirebaseAuthMessage(registrationError) || t('validation.registrationFailed');
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('onboarding.teamSetup')}</Text>
        <Text style={styles.subtitle}>{mode === 'register' ? t('onboarding.createProfile') : t('onboarding.signInProfile')}</Text>
      </View>

      <View style={styles.modeRow}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => switchMode('register')}
          style={[styles.modeButton, mode === 'register' && styles.modeButtonActive]}
        >
          <Text style={[styles.modeText, mode === 'register' && styles.modeTextActive]}>{t('common.createTeamAccount')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => switchMode('signIn')}
          style={[styles.modeButton, mode === 'signIn' && styles.modeButtonActive]}
        >
          <Text style={[styles.modeText, mode === 'signIn' && styles.modeTextActive]}>{t('common.signIn')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>{t('common.representativeEmail')}</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={(value) => {
            setError('');
            setRepresentativeEmail(value);
          }}
          placeholder={t('common.emailPlaceholder')}
          style={styles.input}
          value={representativeEmail}
        />

        <Text style={styles.label}>{t('common.password')}</Text>
        <TextInput
          autoCapitalize="none"
          onChangeText={(value) => {
            setError('');
            setPassword(value);
          }}
          placeholder={t('common.passwordPlaceholder')}
          secureTextEntry
          style={styles.input}
          value={password}
        />

        {mode === 'register' && (
          <>
            <Text style={styles.label}>{t('common.teamName')}</Text>
            <TextInput
              onChangeText={(value) => {
                setError('');
                setTeamName(value);
              }}
              placeholder={t('common.teamName')}
              style={styles.input}
              value={teamName}
            />

            <View style={styles.rowHeader}>
              <Text style={styles.label}>{t('common.teamMembers')}</Text>
              <TouchableOpacity accessibilityRole="button" onPress={addMember} style={styles.addButton}>
                <Text style={styles.addIcon}>+</Text>
                <Text style={styles.addText}>{t('common.addMember')}</Text>
              </TouchableOpacity>
            </View>
            {members.map((member, index) => (
              <View key={index} style={styles.memberBlock}>
                <Text style={styles.memberLabel}>{t('common.memberFirstName', { number: index + 1 })}</Text>
                <View style={styles.memberRow}>
                  <TextInput
                    autoCapitalize="words"
                    onChangeText={(value) => updateMember(index, value)}
                    placeholder={t('common.firstNamePlaceholder')}
                    returnKeyType="next"
                    style={[styles.input, styles.memberInput]}
                    value={member}
                  />
                  <TouchableOpacity accessibilityRole="button" onPress={() => removeMember(index)} style={styles.removeButton}>
                    <Text style={styles.removeIcon}>x</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {validMembers.length > 0 && (
              <View style={styles.previewCard}>
                <Text style={styles.previewTitle}>{t('common.registeredMembers')}</Text>
                {validMembers.map((member, index) => (
                  <Text key={`${member}-${index}`} style={styles.previewText}>{index + 1}. {member}</Text>
                ))}
              </View>
            )}

            <Text style={[styles.label, { marginTop: 16 }]}>{t('common.yearLevel')}</Text>
            <View style={styles.gradeRow}>
              {grades.map((grade) => (
                <TouchableOpacity key={grade} onPress={() => { setError(''); setGradeLevel(grade); }} style={[styles.gradeButton, gradeLevel === grade && styles.gradeSelected]}>
                  <Text style={[styles.gradeText, gradeLevel === grade && styles.gradeSelectedText]}>{t('common.year', { year: grade })}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
        {error.length > 0 && <Text style={styles.error}>{error}</Text>}
      </ScrollView>

      {error.length > 0 && <Text style={styles.footerError}>{error}</Text>}
      <TouchableOpacity style={[styles.btn, (!isValid || isSubmitting) && styles.btnDisabled]} onPress={handleContinue} activeOpacity={0.85}>
        <Text style={styles.btnText}>
          {isSubmitting
            ? t(mode === 'signIn' ? 'common.signingIn' : 'common.registering')
            : t(mode === 'signIn' ? 'common.signIn' : 'common.createTeamAccount')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 48, backgroundColor: '#fff' },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#2F3E46', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#7A8A99' },
  modeRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  modeButton: { alignItems: 'center', borderColor: '#d1d5db', borderRadius: 14, borderWidth: 1, flex: 1, paddingHorizontal: 10, paddingVertical: 12 },
  modeButtonActive: { backgroundColor: '#0074D9', borderColor: '#0074D9' },
  modeText: { color: '#2F3E46', fontSize: 14, fontWeight: '800', textAlign: 'center' },
  modeTextActive: { color: '#fff' },
  form: { flex: 1 },
  label: { fontSize: 16, color: '#2F3E46', fontWeight: '800', marginBottom: 6 },
  input: { borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#f9fafb', color: '#2F3E46', marginBottom: 12, fontSize: 16 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  addButton: { alignItems: 'center', borderColor: '#0074D9', borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 6, paddingHorizontal: 10, paddingVertical: 8 },
  addIcon: { fontSize: 22, color: '#0074D9', fontWeight: '900' },
  addText: { color: '#0074D9', fontSize: 13, fontWeight: '800' },
  memberBlock: { marginBottom: 10 },
  memberLabel: { color: '#4B5B66', fontSize: 13, fontWeight: '800', marginBottom: 4 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  memberInput: { flex: 1, marginBottom: 0 },
  removeButton: { alignItems: 'center', borderColor: '#F3B8C3', borderRadius: 12, borderWidth: 1, height: 46, justifyContent: 'center', width: 46 },
  removeIcon: { fontSize: 18, color: '#d4183d', fontWeight: '900' },
  previewCard: { backgroundColor: '#E8F5E9', borderColor: '#4CAF50', borderRadius: 14, borderWidth: 1, marginBottom: 10, padding: 12 },
  previewTitle: { color: '#1D6B35', fontSize: 14, fontWeight: '900', marginBottom: 4 },
  previewText: { color: '#2F3E46', fontSize: 14, fontWeight: '700', lineHeight: 20 },
  gradeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  gradeButton: { borderColor: '#e5e7eb', borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  gradeSelected: { backgroundColor: '#0074D9', borderColor: '#0074D9' },
  gradeText: { color: '#2F3E46', fontWeight: '800' },
  gradeSelectedText: { color: '#fff' },
  error: { color: '#d4183d', fontSize: 14, marginTop: 4 },
  footerError: { color: '#d4183d', fontSize: 14, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  btn: { paddingVertical: 16, borderRadius: 14, backgroundColor: '#0074D9', alignItems: 'center', marginBottom: 24 },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
