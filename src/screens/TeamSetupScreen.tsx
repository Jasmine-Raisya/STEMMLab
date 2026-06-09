import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTeam } from '../services/teamContext';
import { getFirebaseAuthMessage } from '../services/authService';
import { useThemeColors } from '../ThemeContext';
import { brandColors, radius, typography } from '../tokens';

interface Props {
  onRegistered: () => void;
  onSignedIn: () => void;
}

type AuthMode = 'register' | 'signIn';

export function TeamSetupScreen({ onRegistered, onSignedIn }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColors();
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.heading }]}>{t('onboarding.teamSetup')}</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>{mode === 'register' ? t('onboarding.createProfile') : t('onboarding.signInProfile')}</Text>
      </View>

      <View style={styles.modeRow}>
        <TouchableOpacity
          accessibilityLabel={t('common.createTeamAccount')}
          accessibilityRole="button"
          onPress={() => switchMode('register')}
          style={[styles.modeButton, { backgroundColor: mode === 'register' ? colors.accent : 'transparent', borderColor: mode === 'register' ? colors.accent : colors.border }]}
        >
          <Text style={[styles.modeText, { color: mode === 'register' ? colors.accentText : colors.text }]}>{t('common.createTeamAccount')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityLabel={t('common.signIn')}
          accessibilityRole="button"
          onPress={() => switchMode('signIn')}
          style={[styles.modeButton, { backgroundColor: mode === 'signIn' ? colors.accent : 'transparent', borderColor: mode === 'signIn' ? colors.accent : colors.border }]}
        >
          <Text style={[styles.modeText, { color: mode === 'signIn' ? colors.accentText : colors.text }]}>{t('common.signIn')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <Text style={[styles.label, { color: colors.heading }]}>{t('common.representativeEmail')}</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={(value) => {
            setError('');
            setRepresentativeEmail(value);
          }}
          placeholder={t('common.emailPlaceholder')}
          placeholderTextColor={colors.muted}
          style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
          value={representativeEmail}
        />

        <Text style={[styles.label, { color: colors.heading }]}>{t('common.password')}</Text>
        <TextInput
          autoCapitalize="none"
          onChangeText={(value) => {
            setError('');
            setPassword(value);
          }}
          placeholder={t('common.passwordPlaceholder')}
          placeholderTextColor={colors.muted}
          secureTextEntry
          style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
          value={password}
        />

        {mode === 'register' && (
          <>
            <Text style={[styles.label, { color: colors.heading }]}>{t('common.teamName')}</Text>
            <TextInput
              onChangeText={(value) => {
                setError('');
                setTeamName(value);
              }}
              placeholder={t('common.teamName')}
              placeholderTextColor={colors.muted}
              style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              value={teamName}
            />

            <View style={styles.rowHeader}>
              <Text style={[styles.label, { color: colors.heading }]}>{t('common.teamMembers')}</Text>
              <TouchableOpacity accessibilityLabel={t('common.addMember')} accessibilityRole="button" onPress={addMember} style={[styles.addButton, { borderColor: colors.cta }]}>
                <Text style={styles.addIcon}>+</Text>
                <Text style={styles.addText}>{t('common.addMember')}</Text>
              </TouchableOpacity>
            </View>
            {members.map((member, index) => (
              <View key={index} style={styles.memberBlock}>
                <Text style={[styles.memberLabel, { color: colors.muted }]}>{t('common.memberFirstName', { number: index + 1 })}</Text>
                <View style={styles.memberRow}>
                  <TextInput
                    autoCapitalize="words"
                    onChangeText={(value) => updateMember(index, value)}
                    placeholder={t('common.firstNamePlaceholder')}
                    placeholderTextColor={colors.muted}
                    returnKeyType="next"
                    style={[styles.input, styles.memberInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
                    value={member}
                  />
                  <TouchableOpacity accessibilityLabel="Remove member" accessibilityRole="button" onPress={() => removeMember(index)} style={[styles.removeButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={styles.removeIcon}>x</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {validMembers.length > 0 && (
              <View style={[styles.previewCard, { backgroundColor: colors.softGreen, borderColor: colors.accent }]}>
                <Text style={styles.previewTitle}>{t('common.registeredMembers')}</Text>
                {validMembers.map((member, index) => (
                  <Text key={`${member}-${index}`} style={[styles.previewText, { color: colors.text }]}>{index + 1}. {member}</Text>
                ))}
              </View>
            )}

            <Text style={[styles.label, { color: colors.heading, marginTop: 16 }]}>{t('common.yearLevel')}</Text>
            <View style={styles.gradeRow}>
              {grades.map((grade) => (
                <TouchableOpacity accessibilityLabel={t('common.year', { year: grade })} accessibilityRole="button" key={grade} onPress={() => { setError(''); setGradeLevel(grade); }} style={[styles.gradeButton, { backgroundColor: gradeLevel === grade ? colors.accent : colors.surface, borderColor: gradeLevel === grade ? colors.accent : colors.border }]}>
                  <Text style={[styles.gradeText, { color: gradeLevel === grade ? colors.accentText : colors.text }]}>{t('common.year', { year: grade })}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
        {error.length > 0 && (
          <View style={[styles.errorBanner, { backgroundColor: colors.surface, borderLeftColor: colors.cta }]}>
            <Text style={styles.error}>{error}</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity accessibilityLabel={t(mode === 'signIn' ? 'common.signIn' : 'common.createTeamAccount')} accessibilityRole="button" style={[styles.btn, (!isValid || isSubmitting) && styles.btnDisabled]} onPress={handleContinue} activeOpacity={0.85}>
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
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 48 },
  header: { marginBottom: 24 },
  title: { ...typography.heading2, marginBottom: 4 },
  subtitle: { ...typography.body },
  modeRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  modeButton: { alignItems: 'center', borderRadius: radius.radiusMd, borderWidth: 1, flex: 1, minHeight: 48, justifyContent: 'center', paddingHorizontal: 10, paddingVertical: 12 },
  modeText: { fontSize: 14, fontWeight: '800', textAlign: 'center' },
  form: { flex: 1 },
  label: { ...typography.caption, fontWeight: '800', marginBottom: 6 },
  input: { ...typography.body, borderWidth: 1, borderRadius: radius.radiusMd, marginBottom: 12, paddingHorizontal: 14, paddingVertical: 12 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  addButton: { alignItems: 'center', borderRadius: radius.radiusMd, borderWidth: 1, flexDirection: 'row', gap: 6, minHeight: 48, paddingHorizontal: 10, paddingVertical: 8 },
  addIcon: { fontSize: 22, color: brandColors.coral, fontWeight: '900' },
  addText: { color: brandColors.coral, fontSize: 13, fontWeight: '800' },
  memberBlock: { marginBottom: 10 },
  memberLabel: { ...typography.caption, fontWeight: '800', marginBottom: 4 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  memberInput: { flex: 1, marginBottom: 0 },
  removeButton: { alignItems: 'center', borderRadius: radius.radiusFull, borderWidth: 1, height: 48, justifyContent: 'center', width: 48 },
  removeIcon: { fontSize: 18, color: brandColors.coral, fontWeight: '900' },
  previewCard: { borderLeftWidth: 4, borderRadius: radius.radiusMd, marginBottom: 10, padding: 12 },
  previewTitle: { color: brandColors.charcoal, fontSize: 14, fontWeight: '900', marginBottom: 4 },
  previewText: { fontSize: 14, fontWeight: '700', lineHeight: 20 },
  gradeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  gradeButton: { borderRadius: radius.radiusMd, borderWidth: 1, minHeight: 48, justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  gradeText: { fontWeight: '800' },
  errorBanner: { borderLeftWidth: 4, borderRadius: radius.radiusMd, marginBottom: 12, padding: 12 },
  error: { color: brandColors.coral, fontSize: 14, fontWeight: '800' },
  btn: { alignItems: 'center', backgroundColor: brandColors.coral, borderRadius: radius.radiusMd, justifyContent: 'center', marginBottom: 24, minHeight: 56, paddingVertical: 16 },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '900' },
});
