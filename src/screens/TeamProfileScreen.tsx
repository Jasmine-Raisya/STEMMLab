import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getExperimentRecordsLocal } from '../services/localDb';
import { db } from '../../firebase-config';

interface Props {
  teamData: { teamName: string; members: string[]; yearLevel: string; teamId: string };
  onBack: () => void;
}

export function TeamProfileScreen({ teamData, onBack }: Props) {
  const { t } = useTranslation();
  const members = teamData.members.length > 0 ? teamData.members : ['Member 1', 'Member 2', 'Member 3'];
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const mergeRecords = (localRecords: any[], remoteRecords: any[]) => {
      const recordsById = new Map<string, any>();
      [...localRecords, ...remoteRecords].forEach((record) => {
        if (record?.id) recordsById.set(record.id, record);
      });

      return Array.from(recordsById.values()).sort((a, b) => {
        const aTimestamp = typeof a.timestamp === 'number' ? a.timestamp : 0;
        const bTimestamp = typeof b.timestamp === 'number' ? b.timestamp : 0;
        return bTimestamp - aTimestamp;
      });
    };

    const loadRecords = async () => {
      let localRecords: any[] = [];

      try {
        localRecords = getExperimentRecordsLocal(teamData.teamId);
        if (isMounted) setRecords(localRecords);
      } catch (error) {
        console.error('Failed to fetch past experiment records from SQLite:', error);
      }

      try {
        const recordsRef = collection(db, 'experiment_records');
        const recordsQuery = query(recordsRef, where('teamId', '==', teamData.teamId));
        const snapshot = await getDocs(recordsQuery);
        const remoteRecords = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: data.id ?? docSnap.id,
            teamId: data.teamId,
            activityId: data.activityId,
            score: data.score,
            timestamp: data.timestamp,
            details: data.details ?? null,
          };
        });

        if (isMounted) setRecords(mergeRecords(localRecords, remoteRecords));
      } catch (error) {
        console.error('Failed to fetch past experiment records from Firestore:', error);
      }
    };

    void loadRecords();

    return () => {
      isMounted = false;
    };
  }, [teamData.teamId]);

  const getActivityDetails = (activityId: string) => {
    switch (activityId) {
      case 'parachute':
        return { label: t('parachute.title'), color: '#FF851B', suffix: 's' };
      case 'sound':
        return { label: t('sound.title'), color: '#0074D9', suffix: ' dB' };
      case 'reaction':
        return { label: 'Reaction Speed', color: '#2ECC40', suffix: 'ms' };
      case 'breathing':
        return { label: 'Breathing Pace', color: '#7FDBFF', suffix: ' bpm' };
      default:
        return { label: 'Experiment', color: '#B10DC9', suffix: '' };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('common.teamProfile')}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Team Identification Card */}
        <View style={styles.idCard}>
          <Text style={styles.idLabel}>{t('common.teamId')}</Text>
          <Text style={styles.idValue}>{teamData.teamId || 'Team Alpha #4289'}</Text>
        </View>

        {/* Core Stats Overview */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('common.teamName')}</Text>
            <Text style={styles.statValue}>{teamData.teamName || 'Team Alpha'}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('common.yearLevel')}</Text>
            <Text style={styles.statValue}>{t('common.year', { year: teamData.yearLevel || '8' })}</Text>
          </View>
        </View>

        {/* Team Members List */}
        <Text style={styles.sectionTitle}>{t('common.teamMembers')}</Text>
        <View style={styles.membersList}>
          {members.map((member) => (
            <View key={member} style={styles.memberCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{member.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.memberName}>{member}</Text>
            </View>
          ))}
        </View>

        {/* Relational Past Experiment Records */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Past Experiment Records</Text>
        
        {records.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No past experiment runs recorded yet.</Text>
            <Text style={styles.emptySub}>Launch a science activity from the menu and complete it to save your experimental runs.</Text>
          </View>
        ) : (
          records.map((record) => {
            const act = getActivityDetails(record.activityId);
            const dateStr = new Date(record.timestamp).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
            return (
              <View key={record.id} style={[styles.recordCard, { borderLeftColor: act.color }]}>
                <View style={styles.recordHeader}>
                  <View style={styles.recordTitleCol}>
                    <Text style={[styles.recordTag, { color: act.color, borderColor: act.color }]}>
                      {act.label.toUpperCase()}
                    </Text>
                    <Text style={styles.recordDate}>{dateStr}</Text>
                  </View>
                  <View style={styles.scoreBadge}>
                    <Text style={[styles.scoreText, { color: act.color }]}>
                      {record.score}
                      <Text style={styles.scoreSuffix}>{act.suffix}</Text>
                    </Text>
                  </View>
                </View>
                
                {record.details && (
                  <View style={styles.recordDetails}>
                    {record.activityId === 'parachute' && record.details.attempts && (
                      <Text style={styles.detailItem}>
                        ⚙️ Attempts: {record.details.attempts} runs
                      </Text>
                    )}
                    {record.activityId === 'sound' && record.details.location && (
                      <Text style={styles.detailItem}>
                        📍 Location: {record.details.location} | Risk: {record.details.riskLevel}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}

        <View style={{ height: 40 }} />
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
  statLabel: { fontSize: 14, color: '#7A8A99', marginBottom: 4 },
  statValue: { fontSize: 16, color: '#2F3E46', fontWeight: '800' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#2F3E46', marginBottom: 12 },
  membersList: { gap: 8 },
  memberCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, padding: 14 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0074D9', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  memberName: { fontSize: 16, color: '#2F3E46', fontWeight: '600' },
  
  // Relational Records styling
  recordCard: {
    borderLeftWidth: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordTitleCol: {
    flexDirection: 'column',
    gap: 4,
    alignItems: 'flex-start',
  },
  recordTag: {
    fontSize: 11,
    fontWeight: '800',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  recordDate: {
    fontSize: 13,
    color: '#7A8A99',
    fontWeight: '500',
  },
  scoreBadge: {
    backgroundColor: '#f9fafb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '900',
  },
  scoreSuffix: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7A8A99',
  },
  recordDetails: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    fontSize: 12,
    color: '#556677',
    fontWeight: '600',
  },
  emptyCard: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafbfc',
  },
  emptyText: {
    fontSize: 16,
    color: '#556677',
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    color: '#7A8A99',
    textAlign: 'center',
    lineHeight: 18,
  },
});
