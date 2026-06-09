import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { stemmColors } from '../components/ActivityScaffold';
import { fetchExperimentRecordsForTeam } from '../services/firestoreService';
import { formatTeamDisplayId, useTeam } from '../services/teamContext';
import { useThemeColors } from '../ThemeContext';
import { ActivityId, ExperimentRecord } from '../types/models';
import { brandColors, radius, typography } from '../tokens';

interface Props {
  onBack: () => void;
}

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
  const colors = useThemeColors();
  const { team } = useTeam();
  const members = team?.members ?? [];
  const displayId = formatTeamDisplayId(team);
  const [records, setRecords] = useState<ExperimentRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [recordsError, setRecordsError] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<ExperimentRecord | null>(null);
  const visibleRecords = useMemo(() => dedupeExperimentRecords(records), [records]);

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.elevated, borderColor: colors.border }]}>
        <TouchableOpacity accessibilityLabel="Go back" accessibilityRole="button" onPress={onBack} style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.backIcon, { color: colors.heading }]}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.heading }]}>{t('common.teamProfile')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentInner} style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.idCard, { backgroundColor: colors.accent }]}>
          <Text style={styles.idLabel}>{t('common.teamId')}</Text>
          <Text style={styles.idValue}>{displayId}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.muted }]}>{t('common.teamName')}</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{team?.teamName ?? '-'}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.muted }]}>{t('common.yearLevel')}</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{team?.gradeLevel ? t('common.year', { year: team.gradeLevel }) : '-'}</Text>
          </View>
        </View>

        <View style={[styles.emailCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statLabel, { color: colors.muted }]}>{t('common.representativeEmail')}</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{team?.representativeEmail ?? '-'}</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.heading }]}>{t('common.teamMembers')}</Text>
        {members.map((member) => (
          <View key={member} style={[styles.memberCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.avatar, { backgroundColor: colors.cta }]}>
              <Text style={styles.avatarText}>{member.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={[styles.memberName, { color: colors.text }]}>{member}</Text>
          </View>
        ))}

        <TouchableOpacity accessibilityLabel={t('common.changeGrade')} accessibilityRole="button" onPress={() => undefined} style={[styles.changeBtn, { borderColor: colors.cta }]}>
          <Text style={[styles.changeBtnText, { color: colors.cta }]}>{t('common.changeGrade')}</Text>
        </TouchableOpacity>

        <ExperimentHistorySection
          colors={colors}
          error={recordsError}
          isLoading={isLoadingRecords}
          onSelect={setSelectedRecord}
          records={visibleRecords}
        />
      </ScrollView>

      <ExperimentRecordModal colors={colors} onClose={() => setSelectedRecord(null)} record={selectedRecord} />
    </View>
  );
}

function ExperimentHistorySection({
  colors,
  error,
  isLoading,
  onSelect,
  records,
}: {
  colors: ReturnType<typeof useThemeColors>;
  error: string;
  isLoading: boolean;
  onSelect: (record: ExperimentRecord) => void;
  records: ExperimentRecord[];
}) {
  return (
    <View style={[styles.historySection, { borderTopColor: colors.border }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.heading }]}>Experiment Records</Text>
        <Text style={[styles.countText, { color: colors.muted }]}>{records.length}</Text>
      </View>

      {isLoading && (
        <View style={[styles.historyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ActivityIndicator color={colors.cta} size="small" />
          <Text style={[styles.stateText, { color: colors.muted }]}>Loading records...</Text>
        </View>
      )}

      {!isLoading && error.length > 0 && <Text style={styles.errorText}>{error}</Text>}

      {!isLoading && !error && records.length === 0 && (
        <View style={[styles.historyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.stateTitle, { color: colors.text }]}>No experiment records yet</Text>
          <Text style={[styles.stateText, { color: colors.muted }]}>Completed experiments will appear here after they sync.</Text>
        </View>
      )}

      {!isLoading && records.map((record) => (
        <ExperimentRecordPreview key={record.id} colors={colors} onPress={() => onSelect(record)} record={record} />
      ))}
    </View>
  );
}

function ExperimentRecordPreview({ colors, onPress, record }: { colors: ReturnType<typeof useThemeColors>; onPress: () => void; record: ExperimentRecord }) {
  const detailType = getRecordType(record);
  return (
    <TouchableOpacity accessibilityLabel={`Open ${activityLabels[record.activityId as ActivityId] ?? record.activityId} record`} accessibilityRole="button" activeOpacity={0.82} onPress={onPress} style={[styles.recordCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.recordAccent, { backgroundColor: colors.accent }]}>
        <Text style={styles.recordAccentText}>{getActivityInitial(record.activityId as ActivityId)}</Text>
      </View>
      <View style={styles.recordCopy}>
        <Text style={[styles.recordTitle, { color: colors.text }]}>{activityLabels[record.activityId as ActivityId] ?? record.activityId}</Text>
        <Text style={[styles.recordMeta, { color: colors.muted }]}>{detailType} | {formatDate(record.timestamp)}</Text>
      </View>
      <View style={styles.scorePill}>
        <Text style={[styles.scoreLabel, { color: colors.muted }]}>Score</Text>
        <Text style={[styles.scoreValue, { color: colors.background === brandColors.charcoal ? colors.accent : colors.cta }]}>{formatScore(record.score)}</Text>
      </View>
    </TouchableOpacity>
  );
}

function ExperimentRecordModal({ colors, onClose, record }: { colors: ReturnType<typeof useThemeColors>; onClose: () => void; record: ExperimentRecord | null }) {
  const detailEntries = useMemo(() => flattenDetails(record?.details), [record]);

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={Boolean(record)}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalPanel, { backgroundColor: colors.elevated }]}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <View style={styles.flex}>
              <Text style={[styles.modalTitle, { color: colors.heading }]}>{record ? activityLabels[record.activityId as ActivityId] ?? record.activityId : 'Experiment Record'}</Text>
              <Text style={[styles.modalMeta, { color: colors.muted }]}>{record ? formatDate(record.timestamp) : ''}</Text>
            </View>
            <TouchableOpacity accessibilityLabel="Close experiment record" accessibilityRole="button" onPress={onClose} style={[styles.closeButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.closeText, { color: colors.heading }]}>x</Text>
            </TouchableOpacity>
          </View>

          {record && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.detailGrid}>
                <DetailTile colors={colors} label="Record ID" value={record.id} />
                <DetailTile colors={colors} label="Team ID" value={record.teamId} />
                <DetailTile colors={colors} label="Type" value={getRecordType(record)} />
                <DetailTile colors={colors} label="Score" value={formatScore(record.score)} />
              </View>

              <Text style={[styles.detailTitle, { color: colors.heading }]}>Details</Text>
              {detailEntries.length === 0 ? (
                <Text style={[styles.stateText, { color: colors.muted }]}>No additional details saved.</Text>
              ) : (
                detailEntries.map((entry) => (
                  <View key={entry.label} style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.detailLabel, { color: colors.muted }]}>{entry.label}</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{entry.value}</Text>
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

function DetailTile({ colors, label, value }: { colors: ReturnType<typeof useThemeColors>; label: string; value: string }) {
  return (
    <View style={[styles.detailTile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.detailLabel, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.detailTileValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function getRecordType(record: ExperimentRecord) {
  const type = record.details?.type;
  if (typeof type !== 'string') return 'Experiment';
  return type.split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function dedupeExperimentRecords(records: ExperimentRecord[]) {
  const newestByKey = new Map<string, ExperimentRecord>();

  records.forEach((record) => {
    const key = getRecordDedupeKey(record);
    const existing = newestByKey.get(key);
    if (!existing || record.timestamp > existing.timestamp) {
      newestByKey.set(key, record);
    }
  });

  return Array.from(newestByKey.values()).sort((a, b) => b.timestamp - a.timestamp);
}

function getRecordDedupeKey(record: ExperimentRecord) {
  const detailType = typeof record.details?.type === 'string' ? record.details.type : 'experiment';
  const recordDay = Number.isFinite(record.timestamp) ? new Date(record.timestamp).toDateString() : 'unknown-day';

  if (detailType === 'sensor_sample' || detailType === 'reflection') {
    return `${record.activityId}|${detailType}|${recordDay}`;
  }

  return `${record.activityId}|${detailType}|${recordDay}|${formatScore(record.score)}|${JSON.stringify(record.details ?? {})}`;
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
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  backBtn: { alignItems: 'center', borderRadius: radius.radiusMd, borderWidth: 1, height: 48, justifyContent: 'center', width: 48 },
  backIcon: { fontSize: 30, fontWeight: '900', lineHeight: 34 },
  title: { ...typography.heading2 },
  content: { flex: 1 },
  contentInner: { paddingBottom: 28, paddingHorizontal: 24, paddingTop: 20 },
  idCard: { borderRadius: radius.radiusLg, marginBottom: 20, padding: 24 },
  idLabel: { ...typography.mono, color: stemmColors.text, fontWeight: '800', marginBottom: 4 },
  idValue: { ...typography.heading2, color: stemmColors.text, fontFamily: 'Fira Code' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { borderRadius: radius.radiusMd, borderWidth: 1, flex: 1, padding: 16 },
  emailCard: { borderRadius: radius.radiusMd, borderWidth: 1, marginBottom: 20, padding: 16 },
  statLabel: { fontSize: 14, marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: '800' },
  sectionTitle: { ...typography.heading3, marginBottom: 10 },
  memberCard: { alignItems: 'center', borderRadius: radius.radiusMd, borderWidth: 1, flexDirection: 'row', gap: 12, marginBottom: 8, padding: 14 },
  avatar: { alignItems: 'center', borderRadius: radius.radiusFull, height: 44, justifyContent: 'center', width: 44 },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  memberName: { fontSize: 16 },
  changeBtn: { alignItems: 'center', borderRadius: radius.radiusMd, borderWidth: 2, justifyContent: 'center', marginVertical: 20, minHeight: 48, paddingVertical: 14 },
  changeBtnText: { fontSize: 16, fontWeight: '800' },
  historySection: { borderTopWidth: 1, paddingTop: 20 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  countText: { fontSize: 14, fontWeight: '800', marginBottom: 10 },
  historyState: { alignItems: 'center', borderRadius: radius.radiusMd, borderStyle: 'dashed', borderWidth: 1, gap: 8, padding: 16 },
  stateTitle: { fontSize: 16, fontWeight: '800' },
  stateText: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  errorText: { color: '#d4183d', fontSize: 14, fontWeight: '700' },
  recordCard: { alignItems: 'center', borderRadius: radius.radiusMd, borderWidth: 1, flexDirection: 'row', gap: 12, marginBottom: 10, padding: 12 },
  recordAccent: { alignItems: 'center', borderRadius: radius.radiusSm, height: 46, justifyContent: 'center', width: 46 },
  recordAccentText: { color: stemmColors.text, fontSize: 20, fontWeight: '900' },
  recordCopy: { flex: 1 },
  recordTitle: { fontSize: 16, fontWeight: '900' },
  recordMeta: { fontSize: 13, marginTop: 3 },
  scorePill: { alignItems: 'flex-end', minWidth: 58 },
  scoreLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  scoreValue: { ...typography.heading3, fontFamily: 'Fira Code' },
  modalOverlay: { backgroundColor: 'rgba(52,49,51,0.42)', flex: 1, justifyContent: 'flex-end' },
  modalPanel: { borderTopLeftRadius: radius.radiusXl, borderTopRightRadius: radius.radiusXl, maxHeight: '82%', padding: 20 },
  modalHandle: { alignSelf: 'center', backgroundColor: 'rgba(52,49,51,0.2)', borderRadius: radius.radiusFull, height: 4, marginBottom: 16, width: 40 },
  modalHeader: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  modalTitle: { fontSize: 22, fontWeight: '900' },
  modalMeta: { fontSize: 14, marginTop: 4 },
  closeButton: { alignItems: 'center', borderRadius: 8, borderWidth: 1, height: 40, justifyContent: 'center', width: 40 },
  closeText: { fontSize: 18, fontWeight: '900' },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  detailTile: { borderRadius: 8, borderWidth: 1, flexBasis: '48%', flexGrow: 1, padding: 12 },
  detailTitle: { fontSize: 18, fontWeight: '900', marginBottom: 10 },
  detailLabel: { fontSize: 12, fontWeight: '800', marginBottom: 4, textTransform: 'uppercase' },
  detailTileValue: { fontSize: 14, fontWeight: '800' },
  detailRow: { borderBottomWidth: 1, paddingVertical: 10 },
  detailValue: { fontSize: 14, lineHeight: 20 },
});
