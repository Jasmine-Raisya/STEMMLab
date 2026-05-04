import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props { onNext: () => void; }

export function TeamSetupScreen({ onNext }: Props) {
  const { t } = useTranslation();
  const teamName = 'Phoenix Innovators';
  const members = ['Alex Chen', 'Jordan Smith', 'Taylor Brooks', 'Sam Rivera'];
  const yearLevel = t('common.year', { year: '7' });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('onboarding.teamSetup')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.createProfile')}</Text>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>{t('common.teamName')}</Text>
        <TextInput style={styles.input} value={teamName} editable={false} />

        <View style={styles.rowHeader}>
          <Text style={styles.label}>{t('common.teamMembers')}</Text>
          <Text style={styles.addIcon}>+</Text>
        </View>
        {members.map((member) => (
          <View key={member} style={styles.memberRow}>
            <TextInput style={[styles.input, { flex: 1 }]} value={member} editable={false} />
            <Text style={styles.removeIcon}>x</Text>
          </View>
        ))}

        <Text style={[styles.label, { marginTop: 16 }]}>{t('common.yearLevel')}</Text>
        <View style={styles.input}>
          <Text style={{ color: '#2F3E46', fontSize: 16 }}>{yearLevel}</Text>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.btn} onPress={onNext} activeOpacity={0.85}>
        <Text style={styles.btnText}>{t('onboarding.continue')}</Text>
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
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  addIcon: { fontSize: 22, color: '#0074D9', fontWeight: '900' },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  removeIcon: { fontSize: 18, color: '#d4183d', paddingHorizontal: 6, fontWeight: '900' },
  btn: { paddingVertical: 16, borderRadius: 14, backgroundColor: '#0074D9', alignItems: 'center', marginBottom: 24 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
