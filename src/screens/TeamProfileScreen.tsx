import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { fetchExperimentRecordsForTeam } from '../services/firestoreService';
import { useTeam } from '../services/teamContext';
import { ActivityId, ExperimentRecord } from '../types/models';

interface Props { onBack: () => void; }

const activityLabels: Record<ActivityId, string> = {
  parachute: 'Parachute Drop',
  sound: 'Sound Pollution',
  handFan: 'Hand Fan',
  earthquake: 'Earthquake Structure',
  humanPerformance: 'Human Performance',
  reaction: 'Reaction Board',
  breathing: 'Breathing Pace',
};

export function TeamProfileScreen({ onBack }: Props) {
  const { t } = useTranslation();
  const { team } = useTeam();
  const members = team?.members ?? [];
  const [records, setRecords] = useState<ExperimentRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [recordsError, setRecordsError] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<ExperimentRecord | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadRecords() {
      if (!team?.id) return;
      setIsLoadingRecords(true);
      setRecordsError('');
      try {
        const nextRecords = await fetchExperimentRecordsForTeam(team.id);
        if (mounted) setRecords(nextRecords);
      } catch (error) {
        console.warn('Unable to load experiment records.', error);
        if (mounted) setRecordsError('Unable to load experiment records.');
      } finally {
        if (mounted) setIsLoadingRecords(false);
      }
    }

    void loadRecords();

    return () => {
      mounted = false;
    };
  }, [team?.id]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backIcon}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('common.teamProfile')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentInner} style={styles.content} showsVerticalScrollIndicator={false}>
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

        <ExperimentHistorySection
          error={recordsError}
          isLoading={isLoadingRecords}
          onSelect={setSelectedRecord}
          records={records}
        />
      </ScrollView>

      <ExperimentRecordModal onClose={() => setSelectedRecord(null)} record={selectedRecord} />
    </View>
  );
}

function ExperimentHistorySection({
  error,
  isLoading,
  onSelect,
  records,
}: {
  error: string;
  isLoading: boolean;
  onSelect: (record: ExperimentRecord) => void;
  records: ExperimentRecord[];
}) {
  return (
    <View style={styles.historySection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Experiment Records</Text>
        <Text style={styles.countText}>{records.length}</Text>
      </View>

      {isLoading && (
        <View style={styles.historyState}>
          <ActivityIndicator color="#0074D9" size="small" />
          <Text style={styles.stateText}>Loading records...</Text>
        </View>
      )}

      {!isLoading && error.length > 0 && <Text style={styles.errorText}>{error}</Text>}

      {!isLoading && !error && records.length === 0 && (
        <View style={styles.historyState}>
          <Text style={styles.stateTitle}>No experiment records yet</Text>
          <Text style={styles.stateText}>Completed experiments will appear here after they sync.</Text>
        </View>
      )}

      {!isLoading && records.map((record) => (
        <ExperimentRecordPreview key={record.id} onPress={() => onSelect(record)} record={record} />
      ))}
    </View>
  );
}

function ExperimentRecordPreview({ onPress, record }: { onPress: () => void; record: ExperimentRecord }) {
  const detailType = getRecordType(record);
  return (
    <TouchableOpacity activeOpacity={0.82} onPress={onPress} style={styles.recordCard}>
      <View style={styles.recordAccent}>
        <Text style={styles.recordAccentText}>{getActivityInitial(record.activityId)}</Text>
      </View>
      <View style={styles.recordCopy}>
        <Text style={styles.recordTitle}>{activityLabels[record.activityId] ?? record.activityId}</Text>
        <Text style={styles.recordMeta}>{detailType} | {formatDate(record.timestamp)}</Text>
      </View>
      <View style={styles.scorePill}>
        <Text style={styles.scoreLabel}>Score</Text>
        <Text style={styles.scoreValue}>{formatScore(record.score)}</Text>
      </View>
    </TouchableOpacity>
  );
}

function ExperimentRecordModal({ onClose, record }: { onClose: () => void; record: ExperimentRecord | null }) {
  const detailEntries = useMemo(() => flattenDetails(record?.details), [record]);

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={Boolean(record)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalPanel}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>{record ? activityLabels[record.activityId] ?? record.activityId : 'Experiment Record'}</Text>
              <Text style={styles.modalMeta}>{record ? formatDate(record.timestamp) : ''}</Text>
            </View>
            <TouchableOpacity accessibilityRole="button" onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>x</Text>
            </TouchableOpacity>
          </View>

          {record && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.detailGrid}>
                <DetailTile label="Record ID" value={record.id} />
                <DetailTile label="Team ID" value={record.teamId} />
                <DetailTile label="Type" value={getRecordType(record)} />
                <DetailTile label="Score" value={formatScore(record.score)} />
              </View>

              <Text style={styles.detailTitle}>Details</Text>
              {detailEntries.length === 0 ? (
                <Text style={styles.stateText}>No additional details saved.</Text>
              ) : (
                detailEntries.map((entry) => (
                  <View key={entry.label} style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{entry.label}</Text>
                    <Text style={styles.detailValue}>{entry.value}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

function DetailTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailTile}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailTileValue}>{value}</Text>
    </View>
  );
}

function getRecordType(record: ExperimentRecord) {
  const type = record.details?.type;
  if (typeof type !== 'string') return 'Experiment';
  return type.split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function getActivityInitial(activityId: ActivityId) {
  return (activityLabels[activityId] ?? activityId).charAt(0).toUpperCase();
}

function formatDate(timestamp: number) {
  if (!Number.isFinite(timestamp)) return '-';
  return new Date(timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatScore(score: number) {
  if (!Number.isFinite(score)) return '-';
  return Number.isInteger(score) ? String(score) : score.toFixed(1);
}

function flattenDetails(details?: Record<string, unknown>) {
  if (!details) return [];
  return Object.entries(details)
    .filter(([key]) => key !== 'localRowId')
    .map(([key, value]) => ({
      label: key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^./, (character) => character.toUpperCase()),
      value: formatDetailValue(value),
    }));
}

function formatDetailValue(value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value, null, 2);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  backBtn: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  backIcon: { fontSize: 30, color: '#2F3E46', fontWeight: '700', lineHeight: 34 },
  title: { fontSize: 24, fontWeight: '800', color: '#2F3E46' },
  content: { flex: 1 },
  contentInner: { paddingBottom: 28, paddingHorizontal: 24, paddingTop: 20 },
  idCard: { borderRadius: 8, padding: 22, marginBottom: 20, backgroundColor: '#0074D9' },
  idLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  idValue: { fontSize: 22, color: '#fff', fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 16, backgroundColor: '#f9fafb' },
  emailCard: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 16, backgroundColor: '#f9fafb', marginBottom: 20 },
  statLabel: { fontSize: 14, color: '#7A8A99', marginBottom: 4 },
  statValue: { fontSize: 16, color: '#2F3E46', fontWeight: '800' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#2F3E46', marginBottom: 10 },
  memberCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 14, marginBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0074D9', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  memberName: { fontSize: 16, color: '#2F3E46' },
  changeBtn: { borderWidth: 2, borderColor: '#0074D9', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginVertical: 20 },
  changeBtnText: { color: '#0074D9', fontSize: 16, fontWeight: '800' },
  historySection: { borderTopColor: '#e5e7eb', borderTopWidth: 1, paddingTop: 20 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  countText: { color: '#7A8A99', fontSize: 14, fontWeight: '800', marginBottom: 10 },
  historyState: { alignItems: 'center', borderColor: '#e5e7eb', borderRadius: 8, borderWidth: 1, gap: 8, padding: 16 },
  stateTitle: { color: '#2F3E46', fontSize: 16, fontWeight: '800' },
  stateText: { color: '#7A8A99', fontSize: 14, lineHeight: 20, textAlign: 'center' },
  errorText: { color: '#d4183d', fontSize: 14, fontWeight: '700' },
  recordCard: { alignItems: 'center', borderColor: '#e5e7eb', borderRadius: 8, borderWidth: 1, flexDirection: 'row', gap: 12, marginBottom: 10, padding: 12 },
  recordAccent: { alignItems: 'center', backgroundColor: '#E8F2FA', borderRadius: 8, height: 46, justifyContent: 'center', width: 46 },
  recordAccentText: { color: '#0074D9', fontSize: 20, fontWeight: '900' },
  recordCopy: { flex: 1 },
  recordTitle: { color: '#2F3E46', fontSize: 16, fontWeight: '900' },
  recordMeta: { color: '#7A8A99', fontSize: 13, marginTop: 3 },
  scorePill: { alignItems: 'flex-end', minWidth: 58 },
  scoreLabel: { color: '#7A8A99', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  scoreValue: { color: '#0B5D4C', fontSize: 18, fontWeight: '900' },
  modalOverlay: { backgroundColor: 'rgba(18,49,63,0.35)', flex: 1, justifyContent: 'flex-end' },
  modalPanel: { backgroundColor: '#fff', borderTopLeftRadius: 8, borderTopRightRadius: 8, maxHeight: '82%', padding: 20 },
  modalHeader: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  modalTitle: { color: '#2F3E46', fontSize: 22, fontWeight: '900' },
  modalMeta: { color: '#7A8A99', fontSize: 14, marginTop: 4 },
  closeButton: { alignItems: 'center', borderColor: '#e5e7eb', borderRadius: 8, borderWidth: 1, height: 40, justifyContent: 'center', width: 40 },
  closeText: { color: '#2F3E46', fontSize: 18, fontWeight: '900' },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  detailTile: { backgroundColor: '#f9fafb', borderColor: '#e5e7eb', borderRadius: 8, borderWidth: 1, flexBasis: '48%', flexGrow: 1, padding: 12 },
  detailTitle: { color: '#2F3E46', fontSize: 18, fontWeight: '900', marginBottom: 10 },
  detailLabel: { color: '#7A8A99', fontSize: 12, fontWeight: '800', marginBottom: 4, textTransform: 'uppercase' },
  detailTileValue: { color: '#2F3E46', fontSize: 14, fontWeight: '800' },
  detailRow: { borderBottomColor: '#eef2f7', borderBottomWidth: 1, paddingVertical: 10 },
  detailValue: { color: '#2F3E46', fontSize: 14, lineHeight: 20 },
});
