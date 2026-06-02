import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTeam } from '../services/teamContext';

interface Props { onBack: () => void; }

export function TeamProfileScreen({ onBack }: Props) {
  const { t } = useTranslation();
  const { team } = useTeam();
  const members = team?.members ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('common.teamProfile')}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.idCard}>
          <Text style={styles.idLabel}>{t('common.teamId')}</Text>
          <Text style={styles.idValue}>{team?.id ?? '-'}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('common.teamName')}</Text>
            <Text style={styles.statValue}>{team?.teamName ?? '-'}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('common.yearLevel')}</Text>
            <Text style={styles.statValue}>{team?.gradeLevel ? t('common.year', { year: team.gradeLevel }) : '-'}</Text>
          </View>
        </View>

        <View style={styles.emailCard}>
          <Text style={styles.statLabel}>{t('common.representativeEmail')}</Text>
          <Text style={styles.statValue}>{team?.representativeEmail ?? '-'}</Text>
        </View>

        <Text style={styles.sectionTitle}>{t('common.teamMembers')}</Text>
        {members.map((member) => (
          <View key={member} style={styles.memberCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{member.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.memberName}>{member}</Text>
          </View>
        ))}

        <TouchableOpacity style={styles.changeBtn}>
          <Text style={styles.changeBtnText}>{t('common.changeGrade')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  backIcon: { fontSize: 30, color: '#2F3E46', fontWeight: '700', lineHeight: 34 },
  title: { fontSize: 24, fontWeight: '800', color: '#2F3E46' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  idCard: { borderRadius: 18, padding: 22, marginBottom: 20, backgroundColor: '#0074D9' },
  idLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  idValue: { fontSize: 22, color: '#fff', fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, padding: 16, backgroundColor: '#f9fafb' },
  emailCard: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, padding: 16, backgroundColor: '#f9fafb', marginBottom: 20 },
  statLabel: { fontSize: 14, color: '#7A8A99', marginBottom: 4 },
  statValue: { fontSize: 16, color: '#2F3E46', fontWeight: '800' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#2F3E46', marginBottom: 10 },
  memberCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, padding: 14, marginBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0074D9', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  memberName: { fontSize: 16, color: '#2F3E46' },
  changeBtn: { borderWidth: 2, borderColor: '#0074D9', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginVertical: 20 },
  changeBtnText: { color: '#0074D9', fontSize: 16, fontWeight: '800' },
});
